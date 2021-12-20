import CopyIcon from "../icons/CopyIcon";

export interface CopyToClipboardProps {
  text: string;
  title?: string;
  subTitle?: string;
}

const CopyToClipboard: React.FC<CopyToClipboardProps> = ({
  text,
  title,
  subTitle,
}) => {
  function handleCopyClicked() {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard.");
  }

  return (
    <>
      {title && (
        <p className="text-left mb-2 pl-4 text-sm text-font-secondary">
          {title}
        </p>
      )}
      <div className="flex items-center rounded bg-gray-50">
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
      {subTitle && (
        <p className="text-left mt-2 pl-4 text-sm text-font-secondary">
          {subTitle}
        </p>
      )}
    </>
  );
};

export default CopyToClipboard;
