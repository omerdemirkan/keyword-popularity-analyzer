export interface DividerProps {
  vertical?: boolean;
  bold?: boolean;
}

const Divider: React.FC<DividerProps> = ({ vertical, bold }) => {
  return (
    <div
      style={
        vertical
          ? {
              width: "1px",
              // width: vertical ? "1px" : "100%",
              // height: vertical ? "100%" : "1px",
            }
          : { height: "1px" }
      }
      className={bold ? "bg-gray-400" : "bg-gray-300"}
    />
  );
};

export default Divider;
