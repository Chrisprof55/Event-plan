import { useCallback, useState } from 'react';
import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { storage } from '../firebase';

export async function deleteStoredPdf(storagePath) {
  if (!storagePath) return;
  await deleteObject(ref(storage, storagePath)).catch(() => {});
}

export function useEventPdf(eventId, event, updateEvent) {
  const [uploading, setUploading] = useState(false);

  const uploadPdf = useCallback(
    async (file) => {
      if (!eventId || !file) return;
      if (file.type !== 'application/pdf') {
        throw new Error('Selecione um ficheiro PDF.');
      }

      setUploading(true);
      try {
        const storagePath = `events/${eventId}/order-${Date.now()}.pdf`;
        const storageRef = ref(storage, storagePath);
        await uploadBytes(storageRef, file);
        const pdfUrl = await getDownloadURL(storageRef);

        if (event?.pdfStoragePath) {
          await deleteStoredPdf(event.pdfStoragePath);
        }

        await updateEvent(eventId, {
          pdfUrl,
          pdfStoragePath: storagePath,
          pdfFileName: file.name,
        });
      } finally {
        setUploading(false);
      }
    },
    [eventId, event?.pdfStoragePath, updateEvent],
  );

  const removePdf = useCallback(async () => {
    if (!eventId) return;
    await deleteStoredPdf(event?.pdfStoragePath);
    await updateEvent(eventId, {
      pdfUrl: null,
      pdfStoragePath: null,
      pdfFileName: null,
    });
  }, [eventId, event?.pdfStoragePath, updateEvent]);

  return { uploadPdf, removePdf, uploading };
}
