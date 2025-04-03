// Este archivo asegura que los íconos de Quill se carguen correctamente
import Quill from "quill";

// @ts-ignore
import ImageIcon from "quill/assets/icons/image.svg";
// @ts-ignore
import VideoIcon from "quill/assets/icons/video.svg";

Quill.imports["ui/image"] = ImageIcon;
Quill.imports["ui/video"] = VideoIcon;
