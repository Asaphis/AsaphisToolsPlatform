interface SelectOption {
  label: string;
  value: string;
}

interface SelectProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: SelectOption[];
  disabled?: boolean;
}

export function Select({
  value,
  onChange,
  options,
  disabled = false
}: SelectProps) {
  return (
    <select
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={`
        block w-full rounded-md border-gray-300 shadow-sm
        focus:border-blue-500 focus:ring-blue-500
        disabled:cursor-not-allowed disabled:bg-gray-100
        ${disabled ? 'opacity-50' : ''}
      `}
    >
      {options.map(option => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}