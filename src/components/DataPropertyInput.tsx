import React, { useState, useEffect } from 'react';
import { useDropdownContext } from './DropdownContext';
import { Snackbar } from '@mui/material'; // Using Material-UI for Snackbar

interface DataPropertyInputProps {
  dataType: string;
  elementOffsetPath: string[];
}

const DataPropertyInput: React.FC<DataPropertyInputProps> = ({ dataType, elementOffsetPath }) => {
  const { mainDataObject, setMainDataObject } = useDropdownContext();
  const [value, setValue] = useState<string | number | null>('');
  const [dateRange, setDateRange] = useState<{ startDate: string; endDate: string }>({
    startDate: '',
    endDate: '',
  });
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string }>({
    open: false,
    message: '',
  });

  useEffect(() => {
    let current: any = mainDataObject;
    for (const key of elementOffsetPath) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        current = '';
        break;
      }
    }

    if (dataType.toLowerCase().includes('datetime') && typeof current === 'object') {
      setDateRange({
        startDate: formatDate(current?.startDate || ''),
        endDate: formatDate(current?.endDate || ''),
      });
    } else {
      setValue(current ?? '');
    }
  }, [elementOffsetPath, mainDataObject, dataType]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);

    setMainDataObject((prev) => {
      const updatedObject = { ...prev };
      let current: any = updatedObject;

      for (let i = 0; i < elementOffsetPath.length - 1; i++) {
        const key = elementOffsetPath[i];
        if (typeof current[key] !== 'object') {
          throw new Error(`Invalid path: ${key} is not an object`);
        }
        current = current[key];
      }

      const lastKey = elementOffsetPath[elementOffsetPath.length - 1];
      current[lastKey] = newValue;

      return updatedObject;
    });
  };

  const handleDateRangeChange = (key: 'startDate' | 'endDate', value: string) => {
    const formattedValue = formatDate(value);
    const newDateRange = { ...dateRange, [key]: formattedValue };

    if (newDateRange.startDate && newDateRange.endDate) {
      const startDate = new Date(newDateRange.startDate);
      const endDate = new Date(newDateRange.endDate);

      if (startDate >= endDate) {
        setSnackbar({
          open: true,
          message: 'Start date must be earlier than end date.',
        });
        return;
      }
    }

    setDateRange(newDateRange);

    setMainDataObject((prev) => {
      const updatedObject = { ...prev };
      let current: any = updatedObject;

      for (let i = 0; i < elementOffsetPath.length - 1; i++) {
        const key = elementOffsetPath[i];
        if (typeof current[key] !== 'object') {
          throw new Error(`Invalid path: ${key} is not an object`);
        }
        current = current[key];
      }

      const lastKey = elementOffsetPath[elementOffsetPath.length - 1];
      current[lastKey] = { ...current[lastKey], [key]: formattedValue };

      return updatedObject;
    });
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return date.toISOString().slice(0, 19); // Format as YYYY-MM-DDTHH:mm:ss
  };

  const closeSnackbar = () => setSnackbar({ open: false, message: '' });

  let inputType: string = 'text';
  if (dataType.toLowerCase().includes('datetime')) {
    inputType = 'datetime-local';
  } else if (dataType.toLowerCase().includes('integer')) {
    inputType = 'number';
  } else if (dataType.toLowerCase().includes('float')) {
    inputType = 'number';
  }

  if (dataType.toLowerCase().includes('datetime')) {
    return (
      <div>
        <label>
          Start Date:
          <input
            type="datetime-local"
            value={dateRange.startDate}
            onChange={(e) => handleDateRangeChange('startDate', e.target.value)}
          />
        </label>
        <label>
          End Date:
          <input
            type="datetime-local"
            value={dateRange.endDate}
            onChange={(e) => handleDateRangeChange('endDate', e.target.value)}
          />
        </label>
        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={closeSnackbar}
          message={snackbar.message}
        />
      </div>
    );
  }

  return (
    <input
      type={inputType}
      value={value ?? ''}
      onChange={handleInputChange}
      step={dataType.toLowerCase().includes('float') ? 'any' : undefined}
    />
  );
};

export default DataPropertyInput;
