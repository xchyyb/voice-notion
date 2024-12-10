import { NextResponse } from 'next/server';

const DIFY_API_KEY = process.env.DIFY_API_KEY;
const DIFY_API_URL = process.env.DIFY_API_URL;

interface FetchError extends Error {
  cause?: Error;
  status?: number;
}

// 将 base64 转换为 File 对象
async function base64ToFile(base64String: string): Promise<File> {
  const base64Data = base64String.split(',')[1];
  const binaryString = atob(base64Data);
  const bytes = new Uint8Array(binaryString.length);
  
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  
  const blob = new Blob([bytes], { type: 'audio/wav' });
  return new File([blob], 'audio.wav', { type: 'audio/wav' });
}

export async function POST(request: Request) {
  try {
    const { file: base64Audio, user } = await request.json();
    
    if (!base64Audio) {
      return NextResponse.json(
        { error: 'No audio data provided' },
        { status: 400 }
      );
    }

    if (!DIFY_API_URL || !DIFY_API_KEY) {
      console.error('Missing configuration:', { DIFY_API_URL, DIFY_API_KEY });
      throw new Error('Dify API configuration is missing');
    }

    console.log('Starting transcription process...');
    console.log('Dify API URL:', DIFY_API_URL);
    
    // 将 base64 转换为文件
    const audioFile = await base64ToFile(base64Audio);
    console.log('Audio file created:', audioFile.name, audioFile.size, 'bytes');

    // 准备上传到 Dify 的表单数据
    const formData = new FormData();
    formData.append('file', audioFile);
    formData.append('user', user || 'default_user');
    formData.append('type', 'AUDIO');

    console.log('Uploading file to Dify...');
    
    try {
      // 上传文件到 Dify
      const uploadUrl = `${DIFY_API_URL}/v1/files/upload`;
      console.log('Upload URL:', uploadUrl);
      
      const uploadResponse = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${DIFY_API_KEY}`,
        },
        body: formData,
      });

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        console.error('Dify upload error:', {
          url: uploadUrl,
          status: uploadResponse.status,
          headers: Object.fromEntries(uploadResponse.headers),
          error: errorText
        });
        throw new Error(`Failed to upload file: ${uploadResponse.status} ${errorText}`);
      }

      const uploadData = await uploadResponse.json();
      console.log('Upload successful:', uploadData);
      const fileId = uploadData.id;

      console.log('Running Dify workflow...');
      
      // 运行工作流
      const workflowUrl = `${DIFY_API_URL}/v1/workflows/run`;
      console.log('Workflow URL:', workflowUrl);
      
      const workflowResponse = await fetch(workflowUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${DIFY_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: {
            audio: {
              transfer_method: 'local_file',
              upload_file_id: fileId,
              type: 'audio'
            },
            db_id: process.env.NOTION_DATABASE_ID
          },
          response_mode: 'blocking',
          user: user || 'default_user'
        })
      });

      if (!workflowResponse.ok) {
        const errorText = await workflowResponse.text();
        console.error('Workflow error:', {
          url: workflowUrl,
          status: workflowResponse.status,
          headers: Object.fromEntries(workflowResponse.headers),
          error: errorText
        });
        throw new Error(`Workflow failed: ${workflowResponse.status} ${errorText}`);
      }

      const result = await workflowResponse.json();
      console.log('Workflow completed successfully:', result);
      return NextResponse.json(result);
    } catch (error) {
      const fetchError = error as FetchError;
      console.error('Network error:', {
        message: fetchError.message,
        cause: fetchError.cause,
        status: fetchError.status,
        stack: fetchError.stack
      });
      throw fetchError;
    }
  } catch (error) {
    console.error('Transcription error:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
}; 