import { NextResponse } from 'next/server';

const NOTION_API_KEY = process.env.NOTION_API_KEY;
const DATABASE_ID = process.env.NOTION_DATABASE_ID;

export async function POST(request: Request) {
  try {
    const { startCursor } = await request.json();

    const requestBody: any = {
      page_size: 10,
      sorts: [
        {
          property: "添加时间",
          direction: "descending"
        }
      ],
      filter: {
        and: [
          {
            property: "笔记",
            rich_text: {
              is_not_empty: true
            }
          }
        ]
      }
    };

    if (startCursor) {
      requestBody.start_cursor = startCursor;
    }

    const response = await fetch(
      `https://api.notion.com/v1/databases/${DATABASE_ID}/query`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${NOTION_API_KEY}`,
          'Notion-Version': '2022-06-28',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        cache: 'no-store'
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Notion API Error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });
      throw new Error(`Notion API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error details:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error occurred' },
      { status: 500 }
    );
  }
} 