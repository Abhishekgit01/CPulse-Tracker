import app from "./app";

const PORT = Number(process.env.PORT || 5000);

app.listen(PORT, () => {
  console.log(`CPulse backend running on port ${PORT}`);
  console.log(
    `Gemini API Key Loaded: ${
      process.env.GEMINI_API_KEY
        ? `Yes (starts with ${process.env.GEMINI_API_KEY.substring(0, 5)})`
        : "No"
    }`
  );
});
