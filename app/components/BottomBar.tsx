"use client";

import { Mic, Keyboard, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useRef, useEffect } from 'react';

export default function BottomBar() {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 添加最大录制时长
  const MAX_RECORDING_TIME = Number(process.env.NEXT_PUBLIC_MAX_RECORDING_TIME) || 180;

  useEffect(() => {
    if (recordingTime >= MAX_RECORDING_TIME) {
      stopRecording();
    }
  }, [recordingTime]);

  const startRecording = async () => {
    try {
      // 首先检查浏览器是否支持必要的 API
      if (typeof window === 'undefined') {
        throw new Error('只能在浏览器环境中使用录音功能');
      }

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('您的浏览器不支持录音功能，请使用最新版本的 Chrome、Firefox 或 Safari');
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            sampleRate: 44100
          } 
        });

        const mediaRecorder = new MediaRecorder(stream, {
          mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4'
        });

        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (event) => {
          audioChunksRef.current.push(event.data);
        };

        mediaRecorder.onstop = async () => {
          clearInterval(timerRef.current!);
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
          const audioBase64 = await blobToBase64(audioBlob);
          sendAudioToTranscribe(audioBase64);
          audioChunksRef.current = [];
          setRecordingTime(0);
          
          // 停止所有音轨
          stream.getTracks().forEach(track => track.stop());
        };

        mediaRecorder.start();
        setIsRecording(true);
        timerRef.current = setInterval(() => {
          setRecordingTime((prev) => prev + 1);
        }, 1000);
      } catch (mediaError) {
        if ((mediaError as Error).name === 'NotAllowedError') {
          throw new Error('请允许浏览器访问麦克风后重试');
        } else if ((mediaError as Error).name === 'NotFoundError') {
          throw new Error('未检测到麦克风设备，请检查设备连接');
        } else {
          throw new Error('录音初始化失败，请检查麦克风权限和设备连接');
        }
      }

    } catch (error) {
      console.error('录音错误:', error);
      alert(error instanceof Error ? error.message : '录音功能初始化失败');
      setIsRecording(false);
      setIsTranscribing(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsTranscribing(true);
    }
  };

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const sendAudioToTranscribe = async (audioBase64: string) => {
    try {
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ file: audioBase64, user: 'difyuser' }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to transcribe audio');
      }

      console.log('Transcription result:', data);
      
      const event = new CustomEvent('noteCreated');
      window.dispatchEvent(event);
    } catch (error) {
      console.error('Error transcribing audio:', error);
      alert('转录失败，请重试');
    } finally {
      setIsTranscribing(false);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background">
      {isTranscribing && (
        <div className="absolute top-0 left-0 right-0 transform -translate-y-full">
          <div className="bg-blue-50 text-blue-700 p-2 text-center text-sm border-t border-blue-100">
            笔记生成中...
          </div>
        </div>
      )}
      <div className="p-4 border-t">
        <div className="max-w-3xl mx-auto flex justify-center gap-4">
          <Button
            size="lg"
            className={`flex-1 max-w-[200px] relative ${isRecording ? 'bg-red-500 hover:bg-red-600' : ''}`}
            variant={isRecording ? "default" : "outline"}
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isTranscribing}
          >
            {isRecording ? (
              <>
                <Square className="h-6 w-6" />
                <span className="ml-2">{recordingTime}s / {MAX_RECORDING_TIME}s</span>
              </>
            ) : (
              <Mic className="h-6 w-6 text-[#FF3B30]" />
            )}
            {isRecording && (
              <span className="absolute top-0 left-0 right-0 bottom-0 animate-pulse bg-red-500 opacity-50 rounded-md"></span>
            )}
          </Button>
          <Button
            size="lg"
            className="flex-1 max-w-[200px]"
            variant="outline"
            disabled={isTranscribing}
          >
            <Keyboard className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </div>
  );
}