import http from 'http';

const paths = ['/', '/properties', '/finance', '/settings', '/applications', '/login', '/register'];

async function run() {
  for (const path of paths) {
    await new Promise<void>((resolve) => {
      http.get('http://localhost:3000' + path, (res) => {
        console.log(`${path} -> Status: ${res.statusCode}`);
        resolve();
      }).on('error', (err) => {
        console.log(`${path} -> Error: ${err.message}`);
        resolve();
      });
    });
  }
}

run();
