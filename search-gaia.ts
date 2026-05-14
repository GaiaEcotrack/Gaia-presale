import ZAI from 'z-ai-web-dev-sdk';

async function searchGaia() {
  try {
    const zai = await ZAI.create();
    
    const results = await zai.functions.invoke('web_search', {
      query: 'Gaia Ecotrack cryptocurrency token project',
      num: 10
    });
    
    console.log(JSON.stringify(results, null, 2));
  } catch (error) {
    console.error('Error:', error);
  }
}

searchGaia();
