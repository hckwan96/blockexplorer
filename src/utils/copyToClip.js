import { useState } from "react";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { HiOutlineClipboardCopy, HiOutlineClipboardCheck  } from "react-icons/hi";

export const CopyToClip = ({ text, ...props }) => {
  const [copied, setCopied] = useState(false);

  /**
   * Mark icon as copied and rolback to initial state after 3 seconds
   */
  const markCopiedAndResetIcon = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <span className="inline-flex">
      {copied ? (
        <HiOutlineClipboardCheck color="#0000f0" size="18" />
      ) : (
        <CopyToClipboard className="pointer" text={text} onCopy={() => markCopiedAndResetIcon()}>
          <HiOutlineClipboardCopy  color="#0000f0" fontSize="18" />
        </CopyToClipboard>
      )}
    </span>
  );
};