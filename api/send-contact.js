const { Resend } = require("resend");

const TO_EMAIL = "ssaebbung@gmail.com";

function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function escapeHtml(text) {
  if (typeof text !== "string") return "";
  const map = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
  return text.replace(/[&<>"']/g, (c) => map[c]);
}

module.exports = async (req, res) => {
  setCors(res);
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ success: false, error: "Method not allowed" });
    return;
  }

  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  const FROM_EMAIL = process.env.FROM_EMAIL || "onboarding@resend.dev";

  if (!RESEND_API_KEY) {
    res.status(503).json({
      success: false,
      error: "메일 서버가 설정되지 않았습니다. RESEND_API_KEY를 확인해 주세요.",
    });
    return;
  }

  let body = req.body || {};
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      body = {};
    }
  }
  const { name, phone, age, email } = body;

  if (!name || !phone || !age || !email) {
    res.status(400).json({
      success: false,
      error: "이름, 전화번호, 나이, 이메일을 모두 입력해 주세요.",
    });
    return;
  }

  const resend = new Resend(RESEND_API_KEY);
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
      res.status(500).json({
        success: false,
        error: error.message || "메일 전송에 실패했습니다.",
      });
      return;
    }

    res.status(200).json({ success: true, id: data?.id });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message || "메일 전송 중 오류가 발생했습니다.",
    });
  }
};
