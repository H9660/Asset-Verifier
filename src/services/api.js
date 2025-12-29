export const uploadFile = async (file) => {
  // console.log("sdfsf");
  const formdata = new FormData();
  formdata.append("file", file);
  const uploadStatus = await fetch(`/api/upload/uploadFile`, {
    method: "POST",
    body: formdata,
  });

  const assetData = await uploadStatus.json();
  if (assetData) return assetData;
};

export const getResumeId = async (resumeTitle, walletAddresss) => {
  const form = new FormData();
  form.append("resumeTitle", resumeTitle);
  form.append("walletAddress", walletAddresss);

  const uploadStatus = await fetch(`/api/hash/hashResume`, {
    method: "POST",
    body: form,
  });

  const hash = await uploadStatus.json();
  if (hash) return hash.resumeId;
};

export const uploadDataToBlockchain = async (data) => {
  const form = new FormData();
  form.append("resumeId", JSON.stringify(data.resumeId)); // this is always a string because form has strings as values
  form.append("proofs", JSON.stringify(data.proofs));
  const uploadStatus = await fetch(`/api/upload/uploadToBlockchain`, {
    method: "POST",
    body: form,
  });

  const uploadedProofs = await uploadStatus.json();
  return uploadedProofs;
  // handle later
};

export const saveTransactionsToDB = async (data) => {
  const form = new FormData();
  form.append("transactionData", JSON.stringify(data.transactionData));
  form.append("walletAddress", JSON.stringify(data.walletAddress));
  const uploadStatus = await fetch(`/api/upload/uploadTransactionsToDB`, {
    method: "POST",
    body: form,
  });

  const uploadedProofs = await uploadStatus.json();
  return uploadedProofs;
};

export const getResumes = async (walletAddress) => {
  try {
    const form = new FormData();
    form.append("walletAddress", JSON.stringify(walletAddress));
    const resumes = await fetch(`/api/fetch/getAllResumes`, {
      method: "POST",
      body: form,
    });

    const parsedResumes = await resumes.json();
    return {
      success: true,
      parsedResumes,
    };
  } catch (err) {
    return {
      success: false,
      error: err.message,
    };
  }
};

export const verify = async (walletAddress, proofHashData) => {
  try {
    const form = new FormData();
    form.append("walletAddress", JSON.stringify(walletAddress));
    form.append("proofHashData", JSON.stringify(proofHashData));
    const verificationStatus = await fetch(`/api/verify`, {
      method: "POST",
      body: form,
    });

    const result = await verificationStatus.json();
    if (result.success) {
      return {
        success: true,
      };
    } else {
      return {
        success: false,
        wrongProofs: result.wrongProofs,
      };
    }
  } catch (err) {
    return {
      success: false,
      error: err.message,
    };
  }
};
