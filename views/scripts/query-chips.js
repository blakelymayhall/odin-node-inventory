document.addEventListener("DOMContentLoaded", function () {
    function setupChipSelect({ chipSelector, inputId, dataAttr }) {
        const input = document.getElementById(inputId);
        const allow_multiple = input.getAttribute("data-multiple") === "true";
        const chips = document.querySelectorAll(chipSelector);
        chips.forEach((chip) => {
            chip.addEventListener("click", function () {
                const value = chip.getAttribute(dataAttr);
                if (!allow_multiple) {
                    input.value = value;
                    chip.classList.add("selected");
                    chips.forEach((c) => {
                        if (c !== chip) {
                            c.classList.remove("selected");
                        }
                    });
                } else {
                    let values = input.value ? input.value.split(",").filter(Boolean) : [];
                    const idx = values.indexOf(value);
                    if (idx > -1) {
                        values.splice(idx, 1);
                        chip.classList.remove("selected");
                    } else {
                        values.push(value);
                        chip.classList.add("selected");
                    }
                    input.value = values.join(",") + (values.length ? "," : "");
                }
            });

            if (chip.closest(".search_container")) {
                chip.click();
            }
        });
    }

    setupChipSelect({
        chipSelector: ".food-type-chip",
        inputId: "food_type_id",
        dataAttr: "data-food-type-id",
    });

    setupChipSelect({
        chipSelector: ".price-level-chip",
        inputId: "price_level_id",
        dataAttr: "data-price-level-id",
    });

    setupChipSelect({
        chipSelector: ".serves-drinks-chip",
        inputId: "serves_drinks",
        dataAttr: "data-serves-drinks-bool",
    });

    setupChipSelect({
        chipSelector: ".is-fast-food-chip",
        inputId: "is_fast_food",
        dataAttr: "data-is-fast-food-bool",
    });
});
