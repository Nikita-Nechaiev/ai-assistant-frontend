import React, { useState } from 'react';

interface FileButtonProps {
  id: string;
  label: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const FileButton: React.FC<FileButtonProps> = ({ id, label, onChange }) => {
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      if (file.type.startsWith('image/')) {
        setPreview(URL.createObjectURL(file));
      } else {
        setPreview(null);
      }
    }

    onChange(e);
  };

  return (
    <div className='flex flex-col items-start gap-2'>
      <label
        htmlFor={id}
        className='px-4 py-2 bg-mainDark text-white rounded-md shadow-sm cursor-pointer 
                    hover:bg-mainDarkHover focus:outline-none focus:ring-2 
                    focus:ring-mainDark focus:ring-offset-2'
      >
        {label}
      </label>
      <input type='file' id={id} className='hidden' onChange={handleFileChange} accept='image/*' />

      {preview && (
        <div className='mt-2 max-w-[100px]'>
          <img
            src={preview}
            alt='Selected file'
            className='w-full h-full object-cover rounded-md border border-gray-200 shadow'
          />
        </div>
      )}

      {!preview && <p className='text-sm text-gray-500'>No file selected</p>}
    </div>
  );
};

export default FileButton;
