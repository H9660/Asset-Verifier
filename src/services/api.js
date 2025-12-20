export async function uploadFile(file) {
  const formdata = new FormData();
  formdata.append("file", file);
  const uploadStatus = await fetch(`/api/upload/uploadFile`, {
    method: "POST",
    body: formdata,
  });

  const assetData = await uploadStatus.json();
  if (assetData) return assetData;
}

export const getResumeHash = async (resumeTitle, walletAddresss) => {
  const form = new FormData();
  form.append("resumeTitle", resumeTitle);
  form.append("walletAddress", walletAddresss);

  const uploadStatus = await fetch(`/api/hash/hashResume`, {
    method: "POST",
    body: form,
  });

  const hash = await uploadStatus.json();
  if (hash) {
    return {
      resumeId: hash.resumeId,
      resumeHash: hash.resumeHash,
    };
  }
};

export const uploadDataToBlockchain = async (data) => {
  const form = new FormData();
  form.append("resumeHashData", JSON.stringify(data.resumeHashData)); // this is always a string because form has strings as values

  form.append("proofs", JSON.stringify(data.proofs));
  const uploadStatus = await fetch(`/api/upload/uploadToBlockchain`, {
    method: "POST",
    body: form,
  });

  console.log(uploadStatus);
  // handle later
};
