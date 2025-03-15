
import React from "react";

interface ToggleSwitchProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  label?: string;
  className?: string;
  disabled?: boolean;
}

const ToggleSwitch = ({
  checked = false,
  onChange,
  label = "Toggle me",
  className = "",
  disabled = false,
}: ToggleSwitchProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(e.target.checked);
    }
  };

  return (
    <label className={`relative inline-flex items-center mb-5 cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}>
      <input 
        type="checkbox" 
        className="sr-only peer" 
        checked={checked}
        onChange={handleChange}
        disabled={disabled}
      />
      <div
        className={`
          w-11 h-6 
          bg-gray-400 
          rounded-full 
          border-2 border-black 
          peer-checked:bg-pink-300 
          peer-checked:shadow-[2px_2px_0px_rgba(0,0,0,1)] 
          after:content-[''] 
          after:absolute 
          after:top-[4px] 
          after:left-[4px] 
          after:w-4 
          after:h-4 
          after:bg-white 
          after:rounded-full 
          after:border-2 
          after:border-black 
          after:transition-all 
          peer-checked:after:translate-x-5
          ${disabled ? 'opacity-50' : ''}
        `}
      ></div>
      {label && <span className="ms-3 text-md font-medium">{label}</span>}
    </label>
  );
};

export default ToggleSwitch;
