import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, afterEach } from "vitest";
import Keyboard from "./Keyboard";
import { FINGER_COLORS } from "@/types/content";

describe("Keyboard", () => {
  afterEach(cleanup);

  it("renders 15 white keys for default range C3–C5", () => {
    render(<Keyboard />);
    const whiteKeys = screen.getAllByRole("button").filter((btn) => {
      const label = btn.getAttribute("aria-label") ?? "";
      return !label.includes("#");
    });
    expect(whiteKeys).toHaveLength(15);
  });

  it("renders 10 black keys for default range C3–C5", () => {
    render(<Keyboard />);
    const blackKeys = screen.getAllByRole("button").filter((btn) => {
      const label = btn.getAttribute("aria-label") ?? "";
      return label.includes("#");
    });
    expect(blackKeys).toHaveLength(10);
  });

  it("highlights active note with finger color as background", () => {
    render(<Keyboard activeNote="C4" activeFinger={1} />);
    const key = screen.getByLabelText("C4 (Do)");
    expect(key).toHaveStyle({ backgroundColor: FINGER_COLORS[1] });
  });

  it("displays finger number on active note", () => {
    render(<Keyboard activeNote="C4" activeFinger={2} />);
    const key = screen.getByLabelText("C4 (Do)");
    expect(key).toHaveTextContent("2");
  });

  it("calls onKeyClick with correct note when a key is clicked", () => {
    const handleClick = vi.fn();
    render(<Keyboard onKeyClick={handleClick} />);
    fireEvent.click(screen.getByLabelText("D4 (Re)"));
    expect(handleClick).toHaveBeenCalledWith("D4");
  });

  it("has aria-labels with Spanish note names", () => {
    render(<Keyboard />);
    expect(screen.getByLabelText("C3 (Do)")).toBeInTheDocument();
    expect(screen.getByLabelText("D3 (Re)")).toBeInTheDocument();
    expect(screen.getByLabelText("E3 (Mi)")).toBeInTheDocument();
    expect(screen.getByLabelText("F3 (Fa)")).toBeInTheDocument();
    expect(screen.getByLabelText("G3 (Sol)")).toBeInTheDocument();
    expect(screen.getByLabelText("A3 (La)")).toBeInTheDocument();
    expect(screen.getByLabelText("B3 (Si)")).toBeInTheDocument();
    expect(screen.getByLabelText("C#3 (Do#)")).toBeInTheDocument();
  });

  it("applies reduced opacity to next note", () => {
    render(<Keyboard nextNote="E4" />);
    const key = screen.getByLabelText("E4 (Mi)");
    expect(key.style.opacity).toBe("0.3");
  });
});
