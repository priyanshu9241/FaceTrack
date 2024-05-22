import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Addstudent() {
  const [name, setName] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [image, setImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    // Clean up the video stream when the component unmounts
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const handleNameChange = (e) => setName(e.target.value);
  const handleRollNumberChange = (e) => setRollNumber(e.target.value);
  const handleImageChange = (e) => setImage(e.target.files[0]);

  const startCapture = () => {
    setIsCapturing(true);
    navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
      videoRef.current.srcObject = stream;
      videoRef.current.play();
    });
  };
  const closeCamera = () => {
    setIsCapturing(false);
    navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
      videoRef.current.srcObject = stream;
      videoRef.current.play();
    });
  };
  const captureImage = () => {
    const context = canvasRef.current.getContext("2d");
    context.drawImage(
      videoRef.current,
      0,
      0,
      canvasRef.current.width,
      canvasRef.current.height
    );
    canvasRef.current.toBlob((blob) => {
      const file = new File([blob], "capture.png", { type: "image/png" });
      setImage(file);

      // Stop all video tracks to release the camera
      videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      setIsCapturing(false);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !rollNumber || !image) {
      toast.error("Please fill in all fields!");
      return;
    }

    setIsLoading(true);
    toast.info("Uploading student data...");

    const formData = new FormData();
    formData.append("name", name);
    formData.append("rollNumber", rollNumber);
    formData.append("photo", image);

    try {
      const response = await axios.post(
        "http://localhost:3000/faces/upload",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (progressEvent) => {
            const uploadPercentage = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            toast.update((infoToastId) => ({
              ...infoToastId,
              props: {
                ...infoToastId.props,
                body: `Uploading student data: ${uploadPercentage}%`,
              },
            }));
          },
        }
      );

      setIsLoading(false);
      toast.success(response.data.msg);
      setName("");
      setRollNumber("");
      setImage(null);
    } catch (error) {
      setIsLoading(false);
      toast.error("Error adding student!");
    }
  };

  return (
    <div className="container">
      <ToastContainer />
      <div className="row">
        <div className="col-md-6 offset-md-3">
          <div className="card mt-5">
            <div className="card-body">
              <h2 className="card-title text-center mb-4">Add Student</h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="name" className="form-label">
                    Name:
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="name"
                    value={name}
                    onChange={handleNameChange}
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="rollNumber" className="form-label">
                    Roll Number:
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="rollNumber"
                    value={rollNumber}
                    onChange={handleRollNumberChange}
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="image" className="form-label">
                    Image:
                  </label>
                  <input
                    type="file"
                    className="form-control"
                    id="image"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </div>
                <div className="mb-3">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={startCapture}
                  >
                    Add Face Through Camera
                  </button>
                </div>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isLoading}
                >
                  {isLoading ? "Uploading..." : "Add Student"}
                </button>
              </form>
              {isCapturing && (
                <div className="mt-3">
                  <video ref={videoRef} width="600" height="480" />
                  <canvas
                    ref={canvasRef}
                    width="640"
                    height="480"
                    style={{ display: "none" }}
                  ></canvas>
                  <div className="w-full">
                    <button
                      onClick={captureImage}
                      className="btn btn-success mt-2 mx-auto"
                    >
                      Capture
                    </button>

                    <button
                      onClick={closeCamera}
                      className="btn btn-danger mt-2"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Addstudent;
