import React, { useState, useEffect, useMemo } from "react";
import "./styles.css";

const SideBar = ({
  zones,
  handleAddZone,
  handleSaveZone,
  selectZone,
  setSelectZone,
  isEditZone,
  handleEditZone,
  setIsEditZone,
  removeDrawnZones,
  setIsError,
  handleSelectZone,
  toggleDragZoneMode,
  handleDeleteZone,
}) => {
  const [isClickDragButton, setIsClickDragButton] = useState(false);

  useEffect(() => {}, [selectZone]);

  const isShowZones = useMemo(() => zones.length !== 0, [zones]);

  const handleChangeZoneValueByKey = (e, key) => {
    if (!isEditZone) return;

    setSelectZone({
      ...selectZone,
      ...{
        [key]: e.target.value,
      },
    });
  };

  const handleClickClearButton = () => {
    setIsEditZone(false);

    if (selectZone.hasOwnProperty("isNewZone")) {
      setSelectZone({});
    }

    removeDrawnZones();
    setIsError({});
    isClickDragButton && toggleDragZoneMode();
    isClickDragButton && setIsClickDragButton(!isClickDragButton);
  };

  const clickSaveZone = () => {
    if (!selectZone.hasOwnProperty("title") || selectZone.title === "") {
      setIsError({ isError: true, typeError: "Зона не названа" });
      return;
    }

    handleSaveZone();
    isClickDragButton && toggleDragZoneMode();
    isClickDragButton && setIsClickDragButton(!isClickDragButton);
  };

  return (
    <div className="sideBarWrapper">
      <div>
        <div className="createButtonWrapper">
          {!isEditZone ? (
            <button className="styledButtonAddZone" onClick={handleAddZone}>
              Add zone
            </button>
          ) : (
            <div className="addZoneTitle">Добавление зоны</div>
          )}
        </div>

        {(isEditZone || Object.keys(selectZone).length !== 0) && (
          <div className="inputWrapper">
            <input
              type="text"
              className="styledInput"
              onChange={(e) => handleChangeZoneValueByKey(e, "title")}
              value={selectZone.title}
              placeholder={"Введите название зоны"}
              disabled={!isEditZone}
            />
            <input
              type="text"
              className="styledInput"
              onChange={(e) => handleChangeZoneValueByKey(e, "comment")}
              value={selectZone.comment}
              placeholder={"Введите комментарий"}
              disabled={!isEditZone}
            />
          </div>
        )}

        {Object.keys(selectZone).length !== 0 &&
          !selectZone.hasOwnProperty("isNewZone") &&
          !isEditZone && (
            <div className="toggleEditWrapperButton">
              <button className="styledDeleteButton" onClick={handleDeleteZone}>
                Удалить
              </button>
              <button className="styledEditButton" onClick={handleEditZone}>
                Редактировать
              </button>
            </div>
          )}

        {Object.keys(selectZone).length !== 0 &&
          !selectZone.hasOwnProperty("isNewZone") &&
          isEditZone && (
            <div className="editWrapperButton">
              <button
                style={
                  !isClickDragButton
                    ? { background: "cadetblue" }
                    : { background: "gray" }
                }
                className="styledDragButton"
                onClick={() => {
                  toggleDragZoneMode();
                  setIsClickDragButton(!isClickDragButton);
                }}
              >
                {!isClickDragButton
                  ? "Переместить зону"
                  : "Выключить перемещение"}
              </button>
            </div>
          )}

        {isEditZone && (
          <div className="saveZoneWrapper">
            <button
              style={{ background: "cadetblue", color: "aliceblue" }}
              className="styledSaveZoneButton"
              onClick={clickSaveZone}
            >
              Сохранить
            </button>
            <button
              className="styledSaveZoneButton"
              onClick={handleClickClearButton}
            >
              Отмена
            </button>
          </div>
        )}
      </div>
      <div className="viewZoneWrapper">
        {isShowZones && (
          <>
            <div className="viewZoneTitle">Список зон</div>
            {isShowZones &&
              zones.map((zone, index) => {
                return (
                  <div
                    key={index}
                    className="styledZoneItem"
                    onClick={() => {
                      handleSelectZone(zone);
                    }}
                  >
                    {zone.title}
                  </div>
                );
              })}
          </>
        )}
      </div>
    </div>
  );
};

export default SideBar;
