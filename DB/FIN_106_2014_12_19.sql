# Create data table to save journal entry reversal note
{
    "datatableName": "journal_entry_reverse_note",
    "apptableName": "m_office",
    "multiRow":"true",
    "columns": [      
        {
            "name": "journalentry",
            "type": "String",
            "length":100
        },
        {
            "name": "reversenote",
            "type": "String",
            "length":500
        },
        {
            "name": "createdDate",
            "type": "Date"
        }
    ]
}