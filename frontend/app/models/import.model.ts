import { Step } from "./enums.model";
import { FieldMappingValues, ContentMappingValues } from "./mapping.model";


export interface ImportErrorType {
    pk: number;
    category: string;
    name: string;
    description: string;
    level: string;
}

export interface ImportError {
    pk: number;
    id_import: number;
    id_type: number;
    type: ImportErrorType;
    column: string;
    rows: Array<number>;
    step: number;
    comment: string;
    show?: boolean;
}

export interface Dataset {
    dataset_name: string;
    active: boolean;
}

export interface Import {
	id_import: number;
    format_source_file: string;
    srid: number;
    separator: string;
    detected_separator: null | string;
    encoding: string;
    detected_encoding: string;
    import_table: string;
    full_file_name: string;
    id_dataset: number;
    date_create_import: string;
    date_update_import: string;
    date_end_import: null | string;
    source_count: number;
    import_count: number;
    taxa_count: number;
    date_min_data: string;
    date_max_data: string;
    step: Step;
    uuid_autogenerated: boolean;
    loaded: boolean;
    processed: boolean;
    errors_count: null | number;
    fieldmapping: FieldMappingValues;
    contentmapping: ContentMappingValues;
    columns: null | [string];

    authors_name: string;
    available_encodings?: [string];
    available_formats?: [string];
    available_separators?: [string];
    detected_format?: string;
    task_progress?: number;
    task_id?: string;
    errors?: [ImportError];
    dataset?: Dataset;
}

export interface NomenclatureType {
    id_type: number;
    mnemonique: string;
    label_default: string;
    definition_default: string;

    isCollapsed?: boolean;
}

export interface Nomenclature {
    id_nomenclature: number;
    cd_nomenclature: string;
    mnemonique: string;
    label_default: string;
    definition_default: string;
    source: string;
    statut: string;
    id_broader: number;
    hierarchy: string;
    active: boolean;
    meta_create_date: string;
    meta_update_date: string;
    id_nomenclature: number;
}

export interface ImportValues {
    [target_field: string]: {
        nomenclature_type: NomenclatureType,
        nomenclatures: [Nomenclature],
        values: [string];
    }
}

interface SynthesisTheme {
    id_theme: number,
    name_theme: string,
    fr_label_theme: string,
    eng_label_theme: string,
    desc_theme: string,
}

interface SynthesisField {
    id_field: number,
    name_field: string,
    fr_label: string,
    eng_label: string,
    desc_field: string,
    mandatory: boolean,
    autogenerated: boolean,
    comment: string,
}

export interface SynthesisThemeFields {
    theme: SynthesisTheme,
    fields: [SynthesisField],
}
