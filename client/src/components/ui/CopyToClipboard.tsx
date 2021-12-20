import CopyIcon from "../icons/CopyIcon";

export interface CopyToClipboardProps {
  text: string;
}

const CopyToClipboard: React.FC<CopyToClipboardProps> = ({ text }) => {
  function handleCopyClicked() {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard.");
  }

  return (
    <div className="flex justify-between items-center rounded bg-gray-50">
      <p className="grow text-left py-3 pl-4 text-font-secondary text-ellipsis overflow-hidden">
        {text}
      </p>
      <span
        className="py-3 px-4 cursor-pointer opacity-50 hover:opacity-70"
        onClick={handleCopyClicked}
      >
        <CopyIcon style={{ height: "1.3rem" }} />
      </span>
    </div>
  );
};

export default CopyToClipboard;
