import React, { useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { RiDraggable } from "react-icons/ri";
import { AiOutlineClose } from "react-icons/ai";

interface RasiGridProps {
  centerLabel: string;
}

interface Label {
  id: number;
  name: string;
}

const RasiGrid: React.FC<RasiGridProps> = ({ centerLabel }) => {
  const initialLabels: Label[] = useMemo(
    () => [
      { id: 1, name: "Sun/Suriyan" },
      { id: 2, name: "Moon/Chandran" },
      { id: 3, name: "Mars/Chevai" },
      { id: 4, name: "Mercury/Budhan" },
      { id: 5, name: "Jupiter/Guru" },
      { id: 6, name: "Venus/Sukran" },
      { id: 7, name: "Saturn/Sani" },
      { id: 8, name: "Raghu/Rahu" },
      { id: 9, name: "Kethu/Ketu" },
      { id: 10, name: "Lagnam" },
    ],
    []
  );

  const [labels, setLabels] = useState<Label[]>(initialLabels);
  const [rasiContents, setRasiContents] = useState<string[][]>(
    Array(12).fill([])
  );
  const location = useLocation();

  useEffect(() => {
    const formattedDatarasival = sessionStorage.getItem("formattedDatarasi");
    if (formattedDatarasival) {
      console.log(
        "Retrieved formattedDatarasi from sessionStorage:",
        formattedDatarasival
      );

      // Parse the formatted data
      const data = formattedDatarasival
        .slice(1, -1)
        .split(", ")
        .map((grid) => {
          const match = grid.match(/Grid \d+: (.+)/);
          return match ? match[1].split(",").map((id) => parseInt(id, 10)) : [];
        });

      // Map ids to labels and set the rasi contents
      const newRasiContents = data.map((ids) => {
        return ids
          .map((id) => initialLabels.find((label) => label.id === id)?.name)
          .filter(Boolean) as string[];
      });

      setRasiContents(newRasiContents);
    } else {
      console.log("No formattedDatarasi found in sessionStorage");
    }
  }, [location, initialLabels]);

  const handleDragStart = (
    e: React.DragEvent<HTMLDivElement>,
    label: Label
  ) => {
    e.dataTransfer.setData("labelId", label.id.toString());
    e.dataTransfer.setData("source", "rasi");
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDropRasiBox = (
    e: React.DragEvent<HTMLDivElement>,
    index: number
  ) => {
    e.preventDefault();
    const draggedLabelId = e.dataTransfer.getData("labelId");
    const source = e.dataTransfer.getData("source");

    if (source === "rasi" && draggedLabelId) {
      const draggedLabel = labels.find(
        (label) => label.id === parseInt(draggedLabelId, 10)
      );
      if (
        draggedLabel &&
        !rasiContents[index].includes(draggedLabel.name) &&
        rasiContents[index].length < 6
      ) {
        const newContents = [...rasiContents];
        newContents[index] = [...newContents[index], draggedLabel.name];
        setRasiContents(newContents);

        setLabels((prevLabels) =>
          prevLabels.filter((label) => label.id !== draggedLabel.id)
        );
      }
    }
  };

  const handleRemoveLabel = (index: number, labelIndex: number) => {
    const newContents = [...rasiContents];
    const removedLabel = newContents[index][labelIndex];
    newContents[index].splice(labelIndex, 1);
    setRasiContents(newContents);

    const removedLabelObj = initialLabels.find(
      (label) => label.name === removedLabel
    );
    if (removedLabelObj) {
      setLabels((prevLabels) => [...prevLabels, removedLabelObj]);
    }
  };

  const formatGridData = () => {
    const formattedData = rasiContents
      .map((contents, index) => {
        const boxNumber = index + 1;
        const ids = contents
          .map((label) => initialLabels.find((l) => l.name === label)?.id)
          .filter((id) => id !== undefined);
        return `Grid ${boxNumber}: ${ids.length > 0 ? ids.join(",") : "empty"}`;
      })
      .join(", ");
    return `{${formattedData}}`;
  };

  useEffect(() => {
    const formattedData = formatGridData();
    console.log("Rasi Contents:");
    console.log(formattedData);

    // Store formattedData in sessionStorage
    sessionStorage.setItem("formattedData", JSON.stringify(formattedData));
  }, [rasiContents]);

  return (
    <div className="flex justify-start items-start bg-gray-200 space-x-16">
      <div className="flex flex-col space-y-2">
        {labels.map((label, index) => (
          <div
            key={index}
            draggable
            onDragStart={(e) => handleDragStart(e, label)}
            className="flex items-center bg-redcolor1 text-white px-2 py-3 rounded text-center hover:cursor-grab"
          >
            <RiDraggable className="mr-2" />
            {label.name}
          </div>
        ))}
      </div>

      <div className="">
        <div className="grid grid-cols-4 gap-2">
          {[
            { row: 1, col: 1 },
            { row: 1, col: 2 },
            { row: 1, col: 3 },
            { row: 1, col: 4 },
            { row: 2, col: 4 },
            { row: 3, col: 4 },
            { row: 4, col: 4 },
            { row: 4, col: 3 },
            { row: 4, col: 2 },
            { row: 4, col: 1 },
            { row: 3, col: 1 },
            { row: 2, col: 1 },
          ].map((pos, index) => (
            <div
              key={index}
              style={{ gridRow: pos.row, gridColumn: pos.col }}
              onDrop={(e) => handleDropRasiBox(e, index)}
              onDragOver={handleDragOver}
              className="relative w-48 h-48 rasi-box rounded border border-footer-text-gray flex flex-col items-start justify-center gap-2"
            >
              {rasiContents[index].map((label: string, labelIndex: number) => (
                <div
                  key={labelIndex}
                  className="w-32 h-auto mx-auto relative bg-redcolor1 text-white px-2 py-1 rounded text-center flex items-center justify-between"
                >
                  {label}
                  <AiOutlineClose
                    className="cursor-pointer ml-2"
                    onClick={() => handleRemoveLabel(index, labelIndex)}
                  />
                </div>
              ))}
              {/* <div className="absolute top-0 left-0 m-1 text-xs font-bold text-gray-500">
                {index + 1}
              </div> */}
            </div>
          ))}

          <div className="row-start-2 col-start-2 col-end-4 row-end-4 rounded font-semibold border border-gray bg-gray flex justify-center items-center">
            {centerLabel}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RasiGrid;
