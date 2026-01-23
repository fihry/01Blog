const FormData = require('form-data');
const form = new FormData();
form.append('post', JSON.stringify({ title: '...', content: '...'}), { contentType: 'application/json' });
form.append('media', fs.createReadStream('/path/to/image.jpg'));
fetch('http://localhost:8000/api/posts', { method: 'POST', headers: { Authorization: `Bearer ${token}`, ...form.getHeaders() }, body: form })