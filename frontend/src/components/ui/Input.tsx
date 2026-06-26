import { memo, type InputHTMLAttributes, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { INPUT, FONT } from '../../styles/tokens';

interface FieldProps {
  label?: string;
}

type TextInputProps = FieldProps & InputHTMLAttributes<HTMLInputElement>;
type SelectInputProps = FieldProps & SelectHTMLAttributes<HTMLSelectElement> & { children: React.ReactNode };
type TextareaProps = FieldProps & TextareaHTMLAttributes<HTMLTextAreaElement>;

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: FONT.xs + 2,
  color: '#64748b',
  marginBottom: 6,
  fontWeight: 600,
};

export const TextInput = memo(function TextInput({ label, style, ...rest }: TextInputProps) {
  return (
    <div>
      {label && <label style={labelStyle}>{label}</label>}
      <input style={{ ...INPUT, ...style }} {...rest} />
    </div>
  );
});

export const SelectInput = memo(function SelectInput({ label, children, style, ...rest }: SelectInputProps) {
  return (
    <div>
      {label && <label style={labelStyle}>{label}</label>}
      <select style={{ ...INPUT, ...style }} {...rest}>{children}</select>
    </div>
  );
});

export const Textarea = memo(function Textarea({ label, style, ...rest }: TextareaProps) {
  return (
    <div>
      {label && <label style={labelStyle}>{label}</label>}
      <textarea style={{ ...INPUT, resize: 'vertical', ...style }} {...rest} />
    </div>
  );
});
