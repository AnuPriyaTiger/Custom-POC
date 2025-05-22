import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CreateWidget from './CreateWidget';
import WidgetList from './WidgetList';
import { fetchWidgets, updateWidget, deleteWidget } from '../utils/api';

const WidgetManager = ({ onPreview, handleTable, onlyAxisData }) => {
  const [widgets, setWidgets] = useState([]);
  const [editData, setEditData] = useState(null);

  useEffect(() => {
    const loadWidgets = async () => {
      try {
        const data = await fetchWidgets();
        setWidgets(data);
      } catch (error) {
        toast.error('Failed to fetch widgets');
        console.error(error);
      }
    };

    loadWidgets();
  }, []);

  const handleEdit = (widget, index) => {
    setEditData({ widget, index });
  };

  const handleSaveEdit = async (updatedWidget, index) => {
    try {
      const id = widgets[index].id;
      await updateWidget(id, updatedWidget);
      const updatedWidgets = [...widgets];
      updatedWidgets[index] = updatedWidget;
      setWidgets(updatedWidgets);
      setEditData(null);
      toast.success('Widget updated successfully!');
    } catch (error) {
      toast.error('Failed to update widget');
      console.error(error);
    }
  };

  const handleDelete = async (index) => {
    try {
      const id = widgets[index].id;
      await deleteWidget(id);
      const updatedWidgets = widgets.filter((_, i) => i !== index);
      setWidgets(updatedWidgets);
      toast.info('Widget deleted successfully!');
    } catch (error) {
      toast.error('Failed to delete widget');
      console.error(error);
    }
  };

  return (
    <div className="w-1/2 ">
      <ToastContainer />
      <CreateWidget onSaveEdit={handleSaveEdit}
       editData={editData} onPreview={onPreview} 
       setWidgets={setWidgets} handleTable={handleTable}
       
       />
      <WidgetList widgets={widgets} onEdit={handleEdit} onDelete={handleDelete} />
    </div>
  );
};

export default WidgetManager;
