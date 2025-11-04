import { useState } from "react";

function useModal() {
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const openModal = (item) => {
    setSelectedItem(item);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedItem(null);
  };

  return {
    showModal,
    selectedItem,
    openModal,
    closeModal,
  };
}

export default useModal;
