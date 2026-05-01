const fs = require('fs');
const express = require('express');
const path = require('path');

const app = express();

app.use(express.json());

// 게시글 저장
let posts = [];

// 서버 시작할 때 파일에서 불러오기
if (fs.existsSync('posts.json')) {
  posts = JSON.parse(fs.readFileSync('posts.json'));
}

// 메인 페이지 (index.html 보여주기)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// 글 작성
app.post('/post', (req, res) => {
  const { title, content } = req.body;
  posts.push({ title, content });

  // ⭐ 파일로 저장
  fs.writeFileSync('posts.json', JSON.stringify(posts));

  res.send('저장 완료');
});

// 글 목록 가져오기
app.get('/posts', (req, res) => {
  res.json(posts);
});

// 서버 실행
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("서버 실행됨");
});

let users = {};

// 파일 있으면 불러오기
if (fs.existsSync('users.json')) {
  users = JSON.parse(fs.readFileSync('users.json'));
} else {
  // 없으면 최초 생성
  for (let i = 1; i <= 30; i++) {
    let id = "student" + String(i).padStart(2, '0');
    users[id] = {
      password: id,
      role: "student"
    };
  }

  users["admin"] = {
    password: "admin",
    role: "admin"
  };

  // 파일로 저장
  fs.writeFileSync('users.json', JSON.stringify(users));
}

// 로그인
app.post('/login', (req, res) => {
  const { id, password } = req.body;

  if (users[id] && users[id].password === password) {
    res.json({ success: true, role: users[id].role });
  } else {
    res.json({ success: false });
  }
});

// 비밀번호 변경
app.post('/change-password', (req, res) => {
  const { id, newPassword } = req.body;

  if (users[id]) {
    users[id].password = newPassword;
    fs.writeFileSync('users.json', JSON.stringify(users));
    res.json({ success: true });
  } else {
    res.json({ success: false });
  }
});

// 글 삭제
app.post('/delete', (req, res) => {
  console.log(req.body);
  const { index } = req.body;

  posts.splice(index, 1);

  // 파일 다시 저장
  fs.writeFileSync('posts.json', JSON.stringify(posts));

  res.json({ success: true });
});

app.post('/notice', (req, res) => {
  const { text, user } = req.body;

  if (user === 'admin') {
    notice = text;
    res.json({ success: true });
  } else {
    res.json({ success: false });
  }
});

async function saveNotice() {
  console.log("저장 버튼 클릭됨");

  if (currentUser !== 'admin') {
    alert("관리자만 가능");
    return;
  }

  const text = document.getElementById('noticeText').value;

  await fetch('/notice', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text,
      user: currentUser
    })
  });

  loadNotice();
}