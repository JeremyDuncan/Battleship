export class UIController {
  constructor(doc = document) {
    this.doc = doc;
    this.messageEl = doc.querySelector(".message");
    this.announcementEl = doc.getElementById("announce");
    this.selectionWrapper = doc.getElementById("remove-on-start");
    this.headerEl = doc.getElementById("header");
    this.containerMain = doc.querySelector(".container-main");
    this.previewedCells = new Map();
  }

  setMessage(text) {
    if (this.messageEl) {
      this.messageEl.textContent = text || "";
    }
  }

  clearMessage() {
    this.setMessage("");
  }

  updateShipCount(counterId, remaining) {
    const el = this.doc.getElementById(counterId);
    if (el) {
      el.textContent = ` ${remaining}`;
    }
  }

  prepareForBattle() {
    this.clearPlacementPreview();
    if (this.selectionWrapper) {
      this.selectionWrapper.remove();
      this.selectionWrapper = null;
    }
    if (this.containerMain) {
      this.containerMain.classList.add("battle-mode");
    }
  }

  showVictory() {
    if (this.announcementEl) {
      this.announcementEl.innerHTML =
        "<span class='announcement'><br/>YOU WIN!</span><span onclick='location.reload()' class='retry'>RETRY</span>";
    }
  }

  showDefeat() {
    if (this.announcementEl) {
      this.announcementEl.innerHTML =
        "<span class='announcement'><br/>YOU LOSE!</span><span onclick='location.reload()' class='retry'>RETRY</span>";
    }
  }

  clearAnnouncement() {
    if (this.announcementEl) {
      this.announcementEl.innerHTML = "";
    }
  }

  showPlacementPreview(cells, isValid) {
    this.clearPlacementPreview();
    if (!cells || !cells.length) {
      return;
    }

    const className = isValid ? "preview-valid" : "preview-invalid";
    cells.forEach((cell) => {
      const el = this.getSquareElement("player", cell);
      if (!el) {
        return;
      }
      el.classList.add("preview-active", className);
      this.previewedCells.set(cell, className);
    });
  }

  clearPlacementPreview() {
    if (!this.previewedCells || !this.previewedCells.size) {
      return;
    }
    this.previewedCells.forEach((className, cell) => {
      const el = this.getSquareElement("player", cell);
      if (el) {
        // el.classList.remove("preview-active", "preview-valid", "preview-invalid");
        el.classList.remove("preview-active", className);
      }
    });
    this.previewedCells.clear();
  }

  renderShip(board, cells) {
    cells.forEach((cell) => {
      this.renderSquare(board, cell, "ship-select");
    });
  }

  renderHit(board, index) {
    this.renderSquare(board, index, "ship-hit");
  }

  renderMiss(board, index) {
    this.renderSquare(board, index, "ship-miss");
  }

  renderSquare(board, index, className) {
    const el = this.getSquareElement(board, index);
    if (!el) {
      return;
    }
    el.innerHTML = `<div class='${className}'></div>`;
  }

  getSquareElement(board, index) {
    const targetId =
      board === "cpu" ? `A${index}` : index.toString();
    return this.doc.getElementById(targetId);
  }
}
