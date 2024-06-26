let dictionary = {
        "error_handling": {
            "config_parse_error": "Configuration file parsing error!"
        },
        "flyout_menu": {
            "about": {
                "alert_text": "Extension",
                "alert_title": "About",
                "menu_text": "About"
            },
            "help": {
                "menu_text": "Show help file"
            },
            "preferences": {
                "menu_text": "Preferences"
            },
            "reset_config": {
                "menu_text": "Configuration reset"
            }
        },
        "general": {
            "extension_name": "Minesweeper",
            "html_country_code": "GB",
            "html_lang": "en",
            "language_name": "English"
        },
        "panel_ui": {
            "add_text_in_illustrator_button_tooltip": "Adds the text \"Hello Word\"",
            "add_text_in_illustrator_text_label": "Add text",
            "add_text_in_indesign_button_tooltip": "Adds the text \"Hello Word\"",
            "add_text_in_indesign_text_label": "Add text",
            "add_text_in_photoshop_button_text_label": "Add text",
            "add_text_in_photoshop_button_tooltip": "Adds the text \"Hello Word\"",
            "clear_all_guides_button_tooltip": "Cleans all guides lines in active document.",
            "convert_selection_to_raster_image_button_tooltip": "Rasterize the selection.",
            "create_test_document_button_tooltip": "Creates a test document.",
            "flatten_all_layers_button_tooltip": "Flatten all layers.",
            "flatten_image_button_tooltip": "Flatten image.",
            "images_tools": "Images tools",
            "minesweeper_new_game": "New game",
            "minesweeper_restart_game": "Restart game",
            "run_list_content_button_text_label": "Add text",
            "run_list_content_button_tooltip": "Adds the text selected from the list.",
            "show_all_button_tooltip": "Shows all hidden items in the active document.",
            "status_bar__extension_version": "Version ",
            "status_bar__update_available": "Update available to v",
            "test_list_title": "Text list",
            "text_tools_title": "Text tools",
            "title_for_panel_button_no_1": "Buttons",
            "title_for_panel_button_no_2": "List",
            "title_for_panel_button_no_3": "Minesweeper",
            "toolsPanelNo3Title1": "Minesweeper",
            "tools_panel_no_1_title_for_others": "Universal tools",
            "tools_panel_no_2_list_1_item_1_name": "Hello Word 1",
            "tools_panel_no_2_list_1_item_2_name": "Hello Word 2",
            "tools_panel_no_2_list_1_item_3_name": "Hello Word 3",
            "ungroup_all_button_tooltip": "Ungroups all items in the active document..",
            "unlock_all_button_tooltip": "Unlocks all items in the active document."
        },
        "sui": {
            "preferences_dialog__button_ok": "Save",
            "preferences_dialog__cancel": "Cancel",
            "preferences_dialog__dialog_title": "Preferences",
            "preferences_dialog__language_interface": "Interface",
            "preferences_dialog__language_panel_title": "Language",
            "progress_bar__name": "Progress bar",
            "progress_bar__text": "Processed:",
            "progress_bar_information": "Processing:",
            "show_about__close_button": "Close",
            "show_about__copyright": "All rights reserved.",
            "show_about__dialog_title": "About",
            "show_about__extension_name": "Minesweeper",
            "show_about__license": "Trial version",
            "show_about__www": "twm.io"
        }
    };

function getTextFromVocabulary(key) {
    return dictionary.panel_ui[key] || '!!! ' + key;
}