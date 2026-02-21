INSERT INTO categories (name, description, color) VALUES
('Chemical', 'General laboratory chemicals', '#0d6efd'),
('Cell Culture Media', 'Media and supplements for cell culture', '#198754'),
('Antibody', 'Primary and secondary antibodies', '#6f42c1'),
('Consumable', 'Disposable lab supplies', '#fd7e14'),
('Other', 'Miscellaneous reagents', '#6c757d');

INSERT INTO users (name, email, role) VALUES
('Ya Zhuo', 'ya@lab.edu', 'admin'),
('Lab Member 1', 'member1@lab.edu', 'member'),
('Lab Member 2', 'member2@lab.edu', 'member'),
('Lab Member 3', 'member3@lab.edu', 'member');

INSERT INTO reagents (name, cas_number, catalog_number, lot_number, vendor, category_id, storage_location, storage_temp, current_stock, unit, minimum_threshold, price_per_unit, expiration_date, notes) VALUES
('Sodium Chloride', '7647-14-5', 'S7653', 'SLCD1234', 'Sigma-Aldrich', 1, 'Shelf A-1', 'RT', 500, 'g', 100, 25.00, date('now', '+365 days'), 'ACS grade'),
('DMEM High Glucose', NULL, '11965092', '2345678', 'Gibco', 2, 'Cold Room R1', '4°C', 6, 'bottles (500mL)', 2, 45.00, date('now', '+90 days'), 'With L-glutamine'),
('Fetal Bovine Serum', NULL, '16000044', '2456789', 'Gibco', 2, 'Freezer F2', '-20°C', 3, 'bottles (500mL)', 1, 350.00, date('now', '+180 days'), 'Heat-inactivated'),
('Anti-β-Actin (Mouse)', NULL, 'A5441', '0000123', 'Sigma-Aldrich', 3, 'Freezer F1', '-20°C', 0.2, 'mL', 0.1, 280.00, date('now', '+270 days'), 'Clone AC-15, WB 1:5000'),
('Anti-GAPDH (Rabbit)', NULL, '2118S', '0000456', 'Cell Signaling', 3, 'Freezer F1', '-20°C', 0.1, 'mL', 0.05, 310.00, date('now', '+300 days'), 'WB 1:1000'),
('Trypsin-EDTA 0.25%', NULL, '25200056', '2567890', 'Gibco', 2, 'Cold Room R1', '4°C', 4, 'bottles (100mL)', 2, 32.00, date('now', '+120 days'), NULL),
('Ethanol 200 Proof', '64-17-5', 'E7023', 'SHBK1234', 'Sigma-Aldrich', 1, 'Flammable Cabinet', 'RT', 2, 'L', 1, 55.00, date('now', '+730 days'), 'ACS grade, anhydrous'),
('PBS 10X', '7558-79-4', '70011044', '2678901', 'Gibco', 2, 'Shelf A-2', 'RT', 3, 'bottles (500mL)', 1, 28.00, date('now', '+540 days'), NULL),
('Pipette Tips 200µL', NULL, 'T-200-Y', 'LOT2024A', 'Axygen', 4, 'Bench Drawer B1', 'RT', 5, 'racks', 3, 18.00, NULL, 'Yellow, filtered'),
('Pipette Tips 1000µL', NULL, 'T-1000-B', 'LOT2024B', 'Axygen', 4, 'Bench Drawer B1', 'RT', 2, 'racks', 3, 20.00, NULL, 'Blue, filtered'),
('RIPA Lysis Buffer', NULL, '89900', 'WK3456', 'Thermo Fisher', 1, 'Cold Room R1', '4°C', 1, 'bottles (250mL)', 1, 42.00, date('now', '+400 days'), 'With protease inhibitors'),
('Paraformaldehyde 4%', '30525-89-4', 'J19943', 'PFA2024', 'Thermo Fisher', 1, 'Flammable Cabinet', 'RT', 500, 'mL', 200, 35.00, date('now', '+20 days'), 'EM grade — EXPIRING SOON'),
('Goat Anti-Mouse IgG HRP', NULL, '31430', 'AB9999', 'Thermo Fisher', 3, 'Freezer F1', '-20°C', 0.5, 'mL', 0.2, 195.00, date('now', '+200 days'), 'Secondary antibody, WB 1:10000'),
('Penicillin-Streptomycin', NULL, '15140122', 'PS2024', 'Gibco', 2, 'Freezer F2', '-20°C', 5, 'bottles (100mL)', 2, 22.00, date('now', '+150 days'), '100X solution'),
('Isopropanol', '67-63-0', 'I9516', 'ISO2024', 'Sigma-Aldrich', 1, 'Flammable Cabinet', 'RT', 1, 'L', 0.5, 38.00, date('now', '+600 days'), 'Molecular biology grade');

INSERT INTO usage_log (reagent_id, user_id, quantity_used, date, notes) VALUES
(1, 1, 50, datetime('now', '-3 days'), 'Buffer preparation'),
(2, 2, 1, datetime('now', '-1 days'), 'Cell passage'),
(4, 1, 0.02, datetime('now', '-2 days'), 'Western blot'),
(9, 3, 1, datetime('now'), 'Routine use');
