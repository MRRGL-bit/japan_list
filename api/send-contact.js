/**
 * Resend 문의 메일 API
 * - 수신: ssaebbung@gmail.com
 * - 환경 변수: RESEND_API_KEY, FROM_EMAIL(선택, 기본 onboarding@resend.dev)
 */

const { Resend } = require("resend");

const TO_EMAIL = "ssaebbung@gmail.com";
const DEFAULT_FROM = "onboarding@resend.dev";

function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function escapeHtml(str) {
  if (typeof str !== "string") return "";
  const map = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
  return str.replace(/[&<>"']/g, (c) => map[c]);
}

function parseBody(req) {
  const raw = req.body || {};
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw);
    } catch {
      return {};
    }
  }
  return raw;
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

  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.FROM_EMAIL || DEFAULT_FROM;

  if (!apiKey) {
    res.status(503).json({
      success: false,
      error: "RESEND_API_KEY가 설정되지 않았습니다.",
    });
    return;
  }

  const body = parseBody(req);
  const { name, phone, age, email } = body;

  if (!name || !phone || !age || !email) {
    res.status(400).json({
      success: false,
      error: "이름, 전화번호, 나이, 이메일을 모두 입력해 주세요.",
    });
    return;
  }

  const resend = new Resend(apiKey);
  const html = `
    <h2>일본어 퀴즈 사이트 - 문의</h2>
    <p><strong>이름:</strong> ${escapeHtml(name)}</p>
    <p><strong>전화번호:</strong> ${escapeHtml(phone)}</p>
    <p><strong>나이:</strong> ${escapeHtml(String(age))}</p>
    <p><strong>이메일:</strong> ${escapeHtml(email)}</p>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: fromEmail,
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
