'use client';
import React from 'react';
import { FiCopy } from 'react-icons/fi';

interface Step3SuccessProps {
  result: string | undefined;
  onCopyResult: () => void;
  onRestart: () => void;
}

const Step3Success: React.FC<Step3SuccessProps> = ({
  result,
  onCopyResult,
  onRestart,
}) => {
  const isBigResult = result && result?.length > 1300;

  console.log(
    'In a world increasingly dominated by technology, the intersection between innovation and daily life has transformed the way we interact, learn, and work. The rapid advancement of artificial intelligence and automation has reshaped industries, creating new opportunities while simultaneously posing challenges for the workforce. As businesses adapt to these changes, the demand for skills in data science, programming, and digital communication has surged, prompting a reevaluation of educational curriculums to better prepare the next generation. Moreover, technology has facilitated global connectivity, allowing for collaboration across borders in ways previously unimaginable. Social media platforms have changed how we engage with one another, broadening the scope of our interpersonal relationships but also raising concerns about privacy and mental health. While the convenience of online shopping and remote work has become a staple for many, the digital divide highlights disparities in access to technology, emphasizing the need for equitable solutions. As society navigates these complexities, fostering a culture of adaptability and continuous learning will be essential. The future is dynamic and unpredictable, requiring individuals and organizations alike to embrace change with resilience. Ultimately, the choices we make today regarding the integration of technology into our lives will define the landscape of tomorrow.'.length,
  );

  return (
    <div className='max-w-[800px] mx-auto'>
      {/* Title */}
      <h2 className='text-2xl font-bold text-mainDark mb-6'>AI Usage Result</h2>

      <div className={`border border-mainDark text-mainDark p-4 pb-9 mb-4 rounded relative ${isBigResult && 'max-h-[50vh] overflow-y-scroll'}`}>
        <div className='flex text-gray-600 justify-between items-center mb-3'>
          <span className=' text-sm '>text</span>
          <button
            onClick={onCopyResult}
            disabled={!result}
            className={`flex items-center gap-2 px-3 py-1 rounded transition-colors ${
              result
                ? 'text-mainDark hover:text-mainDarkHover'
                : 'text-gray-400 cursor-not-allowed'
            }`}
          >
            <FiCopy size={18} />
            <span className='text-sm'>Copy</span>
          </button>
        </div>

        {/* Result Text */}
        <p>{result ? result : 'No result available.'}</p>
      </div>

      <button
        onClick={onRestart}
        className='bg-mainDark hover:bg-mainDarkHover text-mainLight px-8 py-3 rounded transition-colors'
      >
        Go back to beginning
      </button>
    </div>
  );
};

export default Step3Success;
