import { useState } from 'react';
import { toast } from 'react-toastify';

const usePreviewImg = () => {
  const [imgUrl, setImgUrl] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (file && file.size > 500000) {
      toast.error('Image size too large');
      return null;
    }

    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();

      reader.onloadend = () => {
        setImgUrl(reader.result);
      };

      reader.readAsDataURL(file);
    } else {
      toast('Invalid file type', ' Please select an image file', 'error');
      setImgUrl(null);
    }
  };
  return { handleImageChange, imgUrl, setImgUrl };
};

export default usePreviewImg;
