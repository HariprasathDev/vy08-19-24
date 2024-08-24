import React, { useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { RiDraggable } from "react-icons/ri";
import { AiOutlineClose } from "react-icons/ai";

interface AmsamGridProps {
  centerLabel: string;
}

interface Label {
  id: number;
  name: string;
}

const AmsamGrid: React.FC<AmsamGridProps> = ({ centerLabel }) => {
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
  const [amsamContents, setAmsamContents] = useState<string[][]>(
    Array(12).fill([])
  );
  const location = useLocation();

  useEffect(() => {
    const formattedDatamsamval = sessionStorage.getItem("formattedDatamsam");
    if (formattedDatamsamval) {
      console.log(
        "Retrieved formattedDatamsam from sessionStorage:",
        formattedDatamsamval
      );

      // Parse the formatted data
      const data = formattedDatamsamval
        .slice(1, -1)
        .split(", ")
        .map((grid) => {
          const match = grid.match(/Grid \d+: (.+)/);
          return match ? match[1].split(",").map((id) => parseInt(id, 10)) : [];
        });

      // Map ids to labels and set the amsam contents
      const newAmsamContents = data.map((ids) => {
        return ids
          .map((id) => initialLabels.find((label) => label.id === id)?.name)
          .filter(Boolean) as string[];
      });

      setAmsamContents(newAmsamContents);
    } else {
      console.log("No formattedDatamsam found in sessionStorage");
    }
  }, [location, initialLabels]);

  const handleDragStart = (
    e: React.DragEvent<HTMLDivElement>,
    label: Label
  ) => {
    e.dataTransfer.setData("labelId", label.id.toString());
    e.dataTransfer.setData("source", "amsam");
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

    if (source === "amsam" && draggedLabelId) {
      const draggedLabel = labels.find(
        (label) => label.id === parseInt(draggedLabelId, 10)
      );
      if (
        draggedLabel &&
        !amsamContents[index].includes(draggedLabel.name) &&
        amsamContents[index].length < 6
      ) {
        const newContents = [...amsamContents];
        newContents[index] = [...newContents[index], draggedLabel.name];
        setAmsamContents(newContents);

        setLabels((prevLabels) =>
          prevLabels.filter((label) => label.id !== draggedLabel.id)
        );
      }
    }
  };

  const handleRemoveLabel = (index: number, labelIndex: number) => {
    const newContents = [...amsamContents];
    const removedLabel = newContents[index][labelIndex];
    newContents[index].splice(labelIndex, 1);
    setAmsamContents(newContents);

    const removedLabelObj = initialLabels.find(
      (label) => label.name === removedLabel
    );
    if (removedLabelObj) {
      setLabels((prevLabels) => [...prevLabels, removedLabelObj]);
    }
  };

  const formatGridData = () => {
    const formattedData = amsamContents
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

  const getCSRFToken = () => {
    let cookieValue = null;
    if (document.cookie && document.cookie !== "") {
      const cookies = document.cookie.split(";");
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.substring(0, 10) === "csrftoken=") {
          cookieValue = decodeURIComponent(cookie.substring(10));
          break;
        }
      }
    }
    return cookieValue;
  };

  const storeAmsaKattamInDatabase = async (formattedData: string) => {
    try {
      const csrfToken = getCSRFToken();
      const response = await fetch("http://localhost:8000/api/profile-horoscope/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrfToken || "",
        },
        body: JSON.stringify({ amsa_kattam: formattedData }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Server Error:", errorData);
        throw new Error("Failed to store data");
      }
      console.log("Amsa Kattam data stored successfully");
    } catch (error) {
      console.error("Error storing Amsa Kattam data:", error);
    }
  };


  useEffect(() => {
    const formattedData = formatGridData();
    console.log("Amsam Contents:");
    console.log(formattedData);

    // Store formattedData in sessionStorage
    sessionStorage.setItem("formattedData1", JSON.stringify(formattedData));

    // Store the value in the database
    storeAmsaKattamInDatabase(formattedData);
  }, [amsamContents]);

  return (
    <div className="flex justify-start items-start bg-gray-200 space-x-16">
      {/* Labels */}
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

      {/* Amsam Grid */}
      <div className="">
        {/* Top Row */}
        <div className="col-span-3 grid grid-cols-4 gap-2">
          {/* Define positions for the grid in a clockwise manner */}
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
              className="w-48 h-48 amsam-box rounded border border-footer-text-gray flex flex-col items-start justify-center gap-2"
            >
              {amsamContents[index].map((label, labelIndex) => (
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

          <div className="row-start-2 amsam-center-box col-start-2 col-end-4 row-end-4 rounded font-semibold border border-gray bg-gray flex justify-center items-center">
            {centerLabel}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AmsamGrid;
