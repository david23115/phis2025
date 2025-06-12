<?php
require 'vendor/autoload.php'; // Asegúrate de que PhpSpreadsheet esté correctamente cargado

use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Lista de carpetas (esto puede ser dinámico, o desde una base de datos)
    $folders = [
        'AGROSHELL', 'ALTEA', 'AMCOR', 'BIMBO', 'BIOLODOS', 'BON GELATI',
        'BUNNY', 'CHOCOLATO', 'DIANA', 'DICORP', 'EXITO', 'FRACTALIA',
        'GCP', 'HERNANDO HUERTAS', 'INVERLIOKA', 'LEVARE', 'PHIS', 'ROLLS',
        'SLB', 'TITO PABON'
    ];

    // Crear un nuevo archivo de Excel
    $spreadsheet = new Spreadsheet();
    $sheet = $spreadsheet->getActiveSheet();
    $sheet->setCellValue('A1', 'Carpetas'); // Encabezado de columna

    // Llenar el archivo con los nombres de las carpetas
    foreach ($folders as $index => $folder) {
        $sheet->setCellValue('A' . ($index + 2), $folder);
    }

    // Guardar el archivo
    $writer = new Xlsx($spreadsheet);
    $fileName = 'carpetas_' . date('Ymd_His') . '.xlsx';
    $writer->save($fileName);

    // Forzar descarga del archivo
    header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    header('Content-Disposition: attachment;filename="' . $fileName . '"');
    header('Cache-Control: max-age=0');
    $writer->save('php://output');
    exit;
}
?>
