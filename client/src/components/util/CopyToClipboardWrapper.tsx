export interface CopyToClipboardWrapperProps {
  text: string;
}

const CopyToClipboardWrapper: React.FC<CopyToClipboardWrapperProps> = ({
  children,
  text,
}) => {
  function handleCopyClicked() {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard.");
  }
  return (
    <span className="cursor-pointer" onClick={handleCopyClicked}>
      {children}
    </span>
  );
};

export default CopyToClipboardWrapper;
