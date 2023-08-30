"use client";

import { ChangeEvent, useState } from "react";

export function MediaPicker() {
  const [preview, setPreview] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<"image" | "video">("image");

  function onFileSelected(event: ChangeEvent<HTMLInputElement>) {
    const { files } = event.target;

    if (!files) return;

    const file = files[0];
    const previewUrl = URL.createObjectURL(file);

    setPreview(previewUrl);

    const isImage = file.type.startsWith("image");
    const isVideo = file.type.startsWith("video");

    if (isImage) setMediaType("image");
    if (isVideo) setMediaType("video");
  }

  return (
    <>
      <input
        onChange={onFileSelected}
        type="file"
        name="media"
        id="media"
        accept="image/*, video/*"
        className="invisible h-0 w-0"
      />

      {mediaType === "image" && preview && (
        // eslint-disable-next-line
        <img
          src={preview}
          alt=""
          className="w-full aspect-video rounded-lg object-cover"
        />
      )}

      {mediaType === "video" && preview && (
        <video
          src={preview}
          className="w-full aspect-video rounded-lg object-cover"
          controls
        >
          Seu navegador não possui suporte para a reprodução de vídeos.
        </video>
      )}
    </>
  );
}
