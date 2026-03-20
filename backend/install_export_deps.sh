#!/bin/bash

echo "Installing required packages for export functionality..."

# Try to install in virtual environment if it exists
if [ -d "venv" ]; then
    source venv/bin/activate
    pip install openpyxl reportlab
elif [ -d "../venv" ]; then
    source ../venv/bin/activate
    pip install openpyxl reportlab
else
    # Try system-wide installation
    pip3 install openpyxl reportlab --break-system-packages 2>/dev/null || \
    pip3 install openpyxl reportlab --user 2>/dev/null || \
    echo "Please install manually: pip install openpyxl reportlab"
fi

echo "Installation complete!"
