let mediaRecorder;
let audioChunks = [];

export async function startRecording(btn) {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  mediaRecorder = new MediaRecorder(stream);
  audioChunks = [];

  mediaRecorder.ondataavailable = e => audioChunks.push(e.data);
  mediaRecorder.start();

  btn.classList.add("recording");
}

export function stopRecording(btn, callback) {
  mediaRecorder.onstop = () => {
    const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
    callback(audioBlob);
  };

  mediaRecorder.stop();
  btn.classList.remove("recording");
}