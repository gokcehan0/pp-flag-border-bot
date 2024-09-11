const { Client, GatewayIntentBits, Events, AttachmentBuilder } = require('discord.js');
const { createCanvas, loadImage } = require('canvas');
const sharp = require('sharp');
const fetch = require('node-fetch');
require('dotenv').config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

const TOKEN = process.env.DISCORD_TOKEN; // Token is now fetched from .env file

client.once(Events.ClientReady, () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on(Events.MessageCreate, async message => {
    if (!message.content.startsWith('!flag') || message.author.bot) return;

    const args = message.content.slice(5).trim().split(/ +/);
    const countryCode = args[0].toLowerCase();

    if (countryCode.length !== 2) {
        message.reply('Lütfen geçerli bir ülke kodu girin.');
        return;
    }

    try {
        const user = message.author;
        const profilePictureURL = user.displayAvatarURL({ format: 'webp', size: 512 });

        const flagURL = `https://raw.githubusercontent.com/hjnilsson/country-flags/master/png1000px/${countryCode}.png`;

        // En az 512px boyutunda olacak şekilde bayrak ve profil resmi alın
        const [profileImageBuffer, flagImage] = await Promise.all([
            fetch(profilePictureURL).then(res => res.buffer()),
            loadImage(flagURL)
        ]);

        // WebP formatını PNG'ye dönüştür
        const profileImagePNG = await sharp(profileImageBuffer).resize(512, 512).toFormat('png').toBuffer();
        const profileImage = await loadImage(profileImagePNG);

        // Bayrağı uygun boyutta ölçeklendir
        const flagImageResized = await sharp(await fetch(flagURL).then(res => res.buffer()))
            .resize(512, 512)
            .toBuffer();
        const flagImageResizedLoaded = await loadImage(flagImageResized);

        // Canvas boyutu 512x512
        const canvas = createCanvas(512, 512);
        const ctx = canvas.getContext('2d');

        // Bayrağı çiz
        ctx.drawImage(flagImageResizedLoaded, 0, 0, canvas.width, canvas.height);

        // Profil fotoğrafını daha büyük yap
        const profileImageSize = 360; // Daha büyük profil fotoğrafı boyutu
        const profileImageX = (canvas.width - profileImageSize) / 2; // Profil fotoğrafının X konumu
        const profileImageY = (canvas.height - profileImageSize) / 2; // Profil fotoğrafının Y konumu

        // Profil fotoğrafını yuvarlak kes
        ctx.save();
        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height / 2, profileImageSize / 2, 0, Math.PI * 2, true);
        ctx.clip();
        ctx.drawImage(profileImage, profileImageX, profileImageY, profileImageSize, profileImageSize);
        ctx.restore();

        const attachment = new AttachmentBuilder(canvas.toBuffer(), { name: 'combined-image.png' });

        message.channel.send({ files: [attachment] });
    } catch (error) {
        console.error('Bir hata oluştu:', error);
        message.reply('Bir hata oluştu. Lütfen tekrar deneyin.');
    }
});

client.on(Events.MessageCreate, async message => {
    if (message.content === '!boykot') {
        try {
            const user = message.author;
            const profilePictureURL = user.displayAvatarURL({ format: 'webp', size: 512 });

            const flagURL = `https://raw.githubusercontent.com/hjnilsson/country-flags/master/png1000px/ps.png`;

            // En az 512px boyutunda olacak şekilde bayrak ve profil resmi alın
            const [profileImageBuffer, flagImage] = await Promise.all([
                fetch(profilePictureURL).then(res => res.buffer()),
                loadImage(flagURL)
            ]);

            // WebP formatını PNG'ye dönüştür
            const profileImagePNG = await sharp(profileImageBuffer).resize(512, 512).toFormat('png').toBuffer();
            const profileImage = await loadImage(profileImagePNG);

            // Canvas boyutu 512x512
            const canvas = createCanvas(512, 512);
            const ctx = canvas.getContext('2d');

            // Bayrağı çiz, sol taraftan başlayarak yerleştir
            ctx.drawImage(flagImage, 0, 0, flagImage.width, flagImage.height, 0, 0, 512, 512);

            // Profil fotoğrafını daha büyük yap
            const profileImageSize = 360; // Daha büyük profil fotoğrafı boyutu
            const profileImageX = (canvas.width - profileImageSize) / 2; // Profil fotoğrafının X konumu
            const profileImageY = (canvas.height - profileImageSize) / 2; // Profil fotoğrafının Y konumu

            // Profil fotoğrafını yuvarlak kes
            ctx.save();
            ctx.beginPath();
            ctx.arc(canvas.width / 2, canvas.height / 2, profileImageSize / 2, 0, Math.PI * 2, true);
            ctx.clip();
            ctx.drawImage(profileImage, profileImageX, profileImageY, profileImageSize, profileImageSize);
            ctx.restore();

            const attachment = new AttachmentBuilder(canvas.toBuffer(), { name: 'boykot-image.png' });

            message.channel.send({ files: [attachment] });
        } catch (error) {
            console.error('Bir hata oluştu:', error);
            message.reply('Bir hata oluştu. Lütfen tekrar deneyin.');
        }
    }
});

client.login(TOKEN);
