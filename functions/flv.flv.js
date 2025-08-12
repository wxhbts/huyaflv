export async function onRequest(context) {
  const { request } = context;
  return handleRequest(request);
}

async function handleRequest(request) {
  const urlParams = new URL(request.url).searchParams;
  const videoUrl = urlParams.get('url');

  if (!videoUrl) {
    return new Response('ȱ�� URL ������ ��ʹ�� flv.flv?url=������ƵURL', { status: 400 });
  }

  try {
    // 1. ��ȡ User-Agent
    const configResponse = await fetch('https://github.iill.moe/xiaoyaocz/dart_simple_live/master/assets/play_config.json');
    if (!configResponse.ok) {
      return new Response(`��ȡ����ʧ��: ${configResponse.status} ${configResponse.statusText}`, { status: configResponse.status });
    }
    const config = await configResponse.json();
    const userAgent = config?.huya?.user_agent || 'HYSDK(Windows, 30000002)_APP(pc_exe&6090007&official)_SDK(trans&2.24.0.5157)'; // Ĭ�� User-Agent
    //console.log("Using User-Agent:", userAgent);

    // 2. ������Ƶ
    const videoResponse = await fetch(videoUrl, {
      headers: {
        'User-Agent': userAgent
      }
    });

    if (!videoResponse.ok) {
      return new Response(`��ȡ��Ƶʧ��: ${videoResponse.status} ${videoResponse.statusText}��URL: ${videoUrl}`, { status: videoResponse.status });
    }

    // 3. ���� Content-Type
    const headers = new Headers(videoResponse.headers);
    let contentType = videoResponse.headers.get('Content-Type') || 'video/x-flv'; // Ĭ�� FLV
    headers.set('Content-Type', contentType);
    headers.set('Cache-Control', 'no-cache');

    // 4. ������Ӧ
    return new Response(videoResponse.body, {
      status: videoResponse.status,
      headers: headers
    });

  } catch (error) {
    console.error('��ȡ��Ƶʱ��������:', error);
    return new Response(`��ȡ��Ƶʱ��������: ${error.message}`, { status: 500 }); // ��Ϊ 500 ��ʾ�������ڲ�����
  }
}
