import fs from 'fs';
import https from 'https';

const download = (url, dest) => {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        return download(response.headers.location, dest).then(resolve).catch(reject);
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => reject(err));
    });
  });
};

async function main() {
  if (!fs.existsSync('public')) {
    fs.mkdirSync('public');
  }
  await download('https://picsum.photos/seed/islamic/1200/628', 'public/seo-home.jpg');
  await download('https://picsum.photos/seed/quran/1200/628', 'public/seo-surah.jpg');
  console.log('Downloaded images');
}

main();