require("dotenv").config();
const path = require("path");
const express = require("express");
const cors = require("cors");
const { Resend } = require("resend");

const app = express();
const PORT = process.env.PORT || 3000;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || "onboarding@resend.dev";
const TO_EMAIL = "ssaebbung@gmail.com";

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

if (!RESEND_API_KEY) {
  console.warn("⚠ RESEND_API_KEY가 .env에 없습니다. 메일 전송이 동작하지 않습니다.");
}

const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

app.post("/api/send-contact", async (req, res) => {
  const { name, phone, age, email } = req.body || {};

  if (!name || !phone || !age || !email) {
    return res.status(400).json({
      success: false,
      error: "이름, 전화번호, 나이, 이메일을 모두 입력해 주세요.",
    });
  }

  if (!resend) {
    return res.status(503).json({
      success: false,
      error: "메일 서버가 설정되지 않았습니다. RESEND_API_KEY를 확인해 주세요.",
    });
  }

  const html = `
    <h2>일본어 퀴즈 사이트 - 문의 내용</h2>
    <p><strong>이름:</strong> ${escapeHtml(name)}</p>
    <p><strong>전화번호:</strong> ${escapeHtml(phone)}</p>
    <p><strong>나이:</strong> ${escapeHtml(String(age))}</p>
    <p><strong>이메일:</strong> ${escapeHtml(email)}</p>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: TO_EMAIL,
      subject: `[일본어 퀴즈] 문의 - ${name}`,
      html,
    });

    if (error) {
      console.error("Resend error:", error);
      return res.status(500).json({
        success: false,
        error: error.message || "메일 전송에 실패했습니다.",
      });
    }

    res.json({ success: true, id: data?.id });
  } catch (err) {
    console.error("Send error:", err);
    res.status(500).json({
      success: false,
      error: err.message || "메일 전송 중 오류가 발생했습니다.",
    });
  }
});

function escapeHtml(text) {
  if (typeof text !== "string") return "";
  const map = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
  return text.replace(/[&<>"']/g, (c) => map[c]);
}

app.listen(PORT, () => {
  console.log(`서버 실행: http://localhost:${PORT}`);
  console.log(`메일 수신 주소: ${TO_EMAIL}`);
});
