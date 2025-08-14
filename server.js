const express = require('express');
const multer = require('multer');
const path = require('path');
const app = express();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, 'images')),
  filename: (req, file, cb) => {
    if (file.fieldname === 'director-photo') {
      if (req.body.pageHtml === 'home1') {
        cb(null, 'tild3232-3632-4139-b530-376333376162__image.png');
      } 
      else if (req.body.pageHtml === 'home3') {
        cb(null, 'tild3264-3534-4263-b133-353833373038__noroot.png');
      }
      else if (req.body.pageHtml === 'home4') {
        cb(null, 'tild3962-3662-4661-b666-636363643335__2_tavasieva_tamara_t.jpg');
      }
      else if (req.body.pageHtml === 'home5') {
        cb(null, 'tild6266-3964-4265-b066-373661326438__19.jpg');
      }
      else if (req.body.pageHtml === 'home11') {
        cb(null, 'tild6662-6336-4838-b137-373132313038__noroot.png');
      }
      else if (req.body.pageHtml === 'homeddt') {
        cb(null, 'tild3937-6666-4833-b531-376462343233__noroot.png');
      }
      else if (req.body.pageHtml === 'homekadgaron') {
        cb(null, 'tild6163-6630-4231-a137-336237353435__1__.jpg');
      }
      else if (req.body.pageHtml === 'homekirovo') {
        cb(null, 'tild3431-3061-4331-b764-626530323963__b50647ba5c5919893813.jpg');
      }
      else if (req.body.pageHtml === 'homekosta') {
        cb(null, 'tild3232-3434-4438-b835-666532623434__noroot.png');
      }
      else if (req.body.pageHtml === 'homekrasnogor') {
        cb(null, 'tild3037-3766-4332-b264-386331376532__noroot.png');
      }
      else if (req.body.pageHtml === 'homemichurino') {
        cb(null, 'tild3833-3436-4231-b531-643166373837__noroot.png');
      }
      else if (req.body.pageHtml === 'homenart') {
        cb(null, 'tild6231-3139-4133-b839-336131653662__gappoeva_resize.jpg');
      }
    }
    else {
      if (file.fieldname.startsWith('staff-photo-')) {
        const idx = file.fieldname.split('-')[2];
        const ext = path.extname(file.originalname) || '.png';
        cb(null, `${req.body.pageHtml}_staff${idx}${ext}`);
      } else {
        cb(null, file.originalname);
      }
    }
  }
});

const upload = multer({ storage });

app.use(express.static(__dirname));
app.use(express.urlencoded({ extended: true }));

app.post('/update_director', upload.fields([
  { name: 'director-photo', maxCount: 1 },
  { name: 'staff-photo-1', maxCount: 1 },
  { name: 'staff-photo-2', maxCount: 1 },
  { name: 'staff-photo-3', maxCount: 1 }
]), (req, res) => {
  const fs = require('fs');
  const htmlPath = path.join(__dirname, `${req.body.pageHtml}.html`);
  const newName = req.body['director-name'];
  const newGreeting = req.body['director-greeting'];

  // Преподаватели
  const staff = [1,2,3].map(i => {
    let photo = undefined;
    if (req.files && req.files[`staff-photo-${i}`] && req.files[`staff-photo-${i}`][0]) {
      const ext = path.extname(req.files[`staff-photo-${i}`][0].originalname) || '.png';
      photo = `images/${req.body.pageHtml}_staff${i}${ext}`;
    }
    return {
      name: req.body[`staff-name-${i}`],
      desc: req.body[`staff-desc-${i}`],
      photo
    };
  });

  fs.readFile(htmlPath, 'utf8', (err, data) => {
    if (err) return res.status(500).send('Ошибка чтения файла');

    // Обновляем имя директора
    let updated = data.replace(/(<div\s+class="t962__uptitle[^\"]*"[^>]*>)([\s\S]*?)(<\/div>)/, `$1${newName}$3`);

    // Обновляем обращение директора (сохраняем переносы строк как <br>)
    if (typeof newGreeting === 'string') {
      const htmlGreeting = newGreeting.replace(/\r?\n/g, '<br />');
      updated = updated.replace(/(<div\s+class="t962__descr[^\"]*"[^>]*>)([\s\S]*?)(<\/div>)/, `$1${htmlGreeting}$3`);
    }

    // Обновляем преподавателей
    let idx = 0;
    updated = updated.replace(/(<div class="t527__bgimg[^"]*"[^>]*data-original=")[^"]+("[\s\S]*?<div class="t527__wrapperleft">[\s\S]*?<div class="t527__persname[^"]*"[^>]*>)[\s\S]*?(<\/div>[\s\S]*?<div class="t527__persdescr[^"]*"[^>]*>)[\s\S]*?(<\/div>)/g, (m, p1, p2, p3, p4) => {
      if (idx >= staff.length) return m;
      const s = staff[idx++];
      const photo = s.photo ? s.photo : (m.match(/data-original="([^"]+)"/)||[])[1];
      const name = s.name || '';
      const desc = s.desc || '';
      return `${p1}${photo}${p2}${name}${p3}${desc}${p4}`;
    });

    fs.writeFile(htmlPath, updated, 'utf8', (err) => {
      if (err) return res.status(500).send('Ошибка записи файла');
      res.send('<p>Данные успешно обновлены!</p>');
    });
  });
});

app.get('/api/director_name', (req, res) => {
  const fs = require('fs');
  const htmlPath = path.join(__dirname, `${req.query.page}.html`);
  fs.readFile(htmlPath, 'utf8', (err, data) => {
    if (err) return res.status(500).send('');
    const match = data.match(/<div\s+class="t962__uptitle[^\"]*"[^>]*>([\s\S]*?)<\/div>/);
    if (match && match[1]) {
      res.send(match[1].trim());
    } else {
      res.send('');
    }
  });
});

app.get('/api/director_greeting', (req, res) => {
  const fs = require('fs');
  const htmlPath = path.join(__dirname, `${req.query.page}.html`);
  //console.log("Director greeting: " + htmlPath);
  fs.readFile(htmlPath, 'utf8', (err, data) => {
    if (err) return res.status(500).send('');
    const match = data.match(/<div\s+class="t962__descr[^\"]*"[^>]*>([\s\S]*?)<\/div>/);
    if (match && match[1]) {
      // Убираем html-теги для textarea, если нужно
      const text = match[1].replace(/<br\s*\/?>(\s*)?/gi, '\n').replace(/<[^>]+>/g, '').trim();
      res.send(text);
    } else {
      res.send('');
    }
  });
});

app.get('/api/staff', (req, res) => {
  const fs = require('fs');
  const htmlPath = path.join(__dirname, `${req.query.page}.html`);
  fs.readFile(htmlPath, 'utf8', (err, data) => {
    if (err) return res.json([]);
    // Парсим 3 блока преподавателей
    const staff = [];
    const re = /<div class="t527__bgimg[^"]*"[^>]*data-original="([^"]+)"[\s\S]*?<div class="t527__wrapperleft">[\s\S]*?<div class="t527__persname[^"]*"[^>]*>([\s\S]*?)<\/div>[\s\S]*?<div class="t527__persdescr[^"]*"[^>]*>([\s\S]*?)<\/div>/g;
    let m;
    while ((m = re.exec(data)) && staff.length < 3) {      
       console.log("Выгружаем фото: " + "../" + m[1]);
       console.log("Выгружаем имя: " + m[2].trim());
       console.log("Выгружаем описание: " + m[3].trim());
       console.log();

      staff.push({
        photo: ("../" + m[1]),
        name: m[2].trim(),
        desc: m[3].trim()
      });
    }
    res.json(staff);
  });
});

app.post('/add_staff', upload.single('staff-photo'), (req, res) => {
  const htmlPage = req.body.pageHtml.split(' ')[0];
  const tTag = req.body.pageHtml.split(' ')[1];

  const fs = require('fs');
  const htmlPath = path.join(__dirname, `${htmlPage}.html`);
  const { 'staff-name': name, 'staff-role': role } = req.body;
  let photoFile = '';
  if (req.body['staff-photo-path'] && req.body['staff-photo-path'].startsWith('images/')) {
    // Копируем выбранную фотографию из images с новым уникальным именем (source не трогаем)
    const srcPath = path.join(__dirname, req.body['staff-photo-path']);
    const ext = path.extname(srcPath) || '.png';
    const base = path.basename(srcPath, ext);
    const fileName = `staff_${Date.now()}_${base}${ext}`;
    const destPath = path.join(__dirname, 'images', fileName);
    // Только копируем, не удаляем исходник
    fs.copyFileSync(srcPath, destPath);
    photoFile = `images/${fileName}`;
  } else if (req.file) {
    // Если файл загружен с компьютера, сохраняем с уникальным именем
    const ext = path.extname(req.file.originalname) || '.png';
    const base = path.basename(req.file.originalname, ext);
    const fileName = `staff_${Date.now()}_${base}${ext}`;
    const destPath = path.join(__dirname, 'images', fileName);
    // Если файл уже в images, просто копируем, не удаляем исходник
    if (req.file.path.startsWith(path.join(__dirname, 'images'))) {
      fs.copyFileSync(req.file.path, destPath);
    } else {
      fs.renameSync(req.file.path, destPath);
    }
    photoFile = `images/${fileName}`;
  } else {
    photoFile = 'images/default_staff.png'; // если не загружено фото
  }
  const uniqueId = Date.now();
  const newStaffHtml = 
  `
  <li class="t${tTag}__col t-col t-col_4 t-list__item t-align_left t${tTag}__col-mobstyle">
    <div class="t${tTag}__itemwrapper t${tTag}__itemwrapper_3">
      <div class="t${tTag}__bgimg t-bgimg" data-original="${photoFile}"
        bgimgfield="li_img__${uniqueId}" data-image-width="360" data-image-height="450"\n
        style="background-image: url('${photoFile}');"
        itemscope itemtype="http://schema.org/ImageObject">
        <meta itemprop="image" content="${photoFile}">
      </div>
      <div class="t${tTag}__wrapperleft">
        <div class="t${tTag}__persname t-name t-name_lg t${tTag}__bottommargin_sm" field="li_persname__${uniqueId}">${name}</div>
        <div class="t${tTag}__persdescr t-descr t-descr_xxs t${tTag}__bottommargin_lg" field="li_persdescr__${uniqueId}">${role}</div>
        <div class="t-divider t${tTag}__line " style="background-color: #b0c7dd; max-width: 100px; height: 1px; opacity:0.80;"></div>
      </div>
    </div>
  </li>
  `;
  fs.readFile(htmlPath, 'utf8', (err, data) => {
    if (err) return res.status(500).send('Ошибка чтения файла');
    const ulRegex = new RegExp(`(<ul[^>]*class="t${tTag}__container[^"]*"[^>]*>)([\\s\\S]*?)(<\\/ul>)`);
    const match = data.match(ulRegex);
    if (!match) {
      console.log('Не найден список преподавателей');
      return res.status(500).send('Не найден список преподавателей');
    }
    const updated = data.replace(ulRegex, `$1$2${newStaffHtml}$3`);
    fs.writeFile(htmlPath, updated, 'utf8', (err) => {
      if (err) {
        console.log('Ошибка записи файла');
        return res.status(500).send('Ошибка записи файла');
      }

      console.log('Преподаватель успешно добавлен!');
      res.send('Преподаватель успешно добавлен!');
    });
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});