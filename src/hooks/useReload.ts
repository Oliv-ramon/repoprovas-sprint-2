import { useContext } from "react";
import { ReloadContext } from "../contexts/ReloadContext";

export default function useReload() {
  const reloadContext = useContext(ReloadContext);
  if (!reloadContext) {
    throw new Error("useAuth must be used inside a AuthContext Provider");
  }

  return reloadContext;
}
