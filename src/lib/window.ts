import { getCurrentWindow, LogicalSize } from "@tauri-apps/api/window";

const MINI_SIZE = new LogicalSize(380, 560);
const MAIN_MIN_SIZE = new LogicalSize(500, 400);

let previousSize: LogicalSize | null = null;

/** Encolhe a janela principal para o modo mini, guardando o tamanho anterior. */
export async function enterMiniWindow() {
  try {
    const win = getCurrentWindow();
    previousSize = (await win.innerSize()).toLogical(await win.scaleFactor());
    await win.setMinSize(null);
    await win.setSize(MINI_SIZE);
  } catch (error) {
    console.error("Falha ao redimensionar para o modo mini:", error);
  }
}

/** Restaura o tamanho que a janela tinha antes do modo mini. */
export async function exitMiniWindow() {
  try {
    const win = getCurrentWindow();
    await win.setSize(previousSize ?? new LogicalSize(1000, 600));
    await win.setMinSize(MAIN_MIN_SIZE);
  } catch (error) {
    console.error("Falha ao restaurar a janela:", error);
  }
}
