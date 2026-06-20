const express = require('express');
const cors = require('cors');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const app = express();
app.use(cors());
app.use(express.json());

const port = 3001;

console.log('Inisialisasi WhatsApp Client...');

// Gunakan LocalAuth agar session tersimpan di folder .wwebjs_auth
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu'
        ]
    }
});

// Generate QR Code di Terminal
client.on('qr', (qr) => {
    console.log('\n=============================================');
    console.log('SILAKAN SCAN QR CODE DI BAWAH MENGGUNAKAN WA:');
    console.log('=============================================\n');
    qrcode.generate(qr, { small: true });
});

// Event ketika client sudah siap
client.on('ready', () => {
    console.log('\n✅ Client is ready! WhatsApp Gateway sudah terhubung.');
});

client.on('authenticated', () => {
    console.log('✅ Authenticated berhasil!');
});

client.on('auth_failure', msg => {
    console.error('❌ Authentication failure', msg);
});

client.initialize();

// Endpoint untuk mengirim pesan
app.post('/send', async (req, res) => {
    try {
        const { target, message } = req.body;

        if (!target || !message) {
            return res.status(400).json({ success: false, message: 'Target (nomor WA) dan message wajib diisi.' });
        }

        // Format target number untuk Indonesia (misal: 0812... menjadi 62812...@c.us)
        let formattedNumber = target.replace(/\D/g, '');
        if (formattedNumber.startsWith('0')) {
            formattedNumber = '62' + formattedNumber.substring(1);
        }
        
        const chatId = formattedNumber + '@c.us';

        // Kirim pesan
        const response = await client.sendMessage(chatId, message);
        console.log(`[INFO] Pesan terkirim ke ${target}`);

        return res.status(200).json({
            success: true,
            message: 'Pesan berhasil dikirim',
            data: response
        });
    } catch (error) {
        console.error('[ERROR] Gagal mengirim pesan:', error);
        return res.status(500).json({
            success: false,
            message: 'Gagal mengirim pesan via WhatsApp',
            error: error.message
        });
    }
});

app.listen(port, () => {
    console.log(`\n🚀 Server WhatsApp Gateway berjalan di http://localhost:${port}`);
    console.log(`Menunggu inisialisasi QR Code...\n`);
});
