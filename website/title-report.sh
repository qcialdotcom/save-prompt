#!/usr/bin/env bash

TARGET_DIR="${1:-dist}"
LIMIT="${2:-55}"
WIDTH=60

line()   { printf '%*s\n' "$WIDTH" '' | tr ' ' "$1"; }
header() { echo; line '='; echo " $1"; line '='; echo; }

# ======================================================
# Build The Project
# ======================================================
echo "Running: npm run build"
if ! npm run build; then
    echo "Build failed. Stopping."
    exit 1
fi

if [[ ! -d "$TARGET_DIR" ]]; then
    echo "Folder '$TARGET_DIR' not found after build."
    exit 1
fi

# =====================================================
# Ask for output file name
# =====================================================
echo
read -r -p "Output file name [title.txt]: " OUT
OUT="${OUT:-title.txt}"

# =====================================================
# Print the entry in the report
# =====================================================
entry() {
    printf '#%s\n  Path  : %s\n  Title : %s\n  Chars : %s\n\n' "$1" "$2" "$3" "$4"
}

# =====================================================
# Extract the title from an HTML file using grep
# with Perl regex.
# =====================================================
get_title() {
    grep -oiP '(?<=<title>).*?(?=</title>)' "$1" | head -n 1
}

# =====================================================
# Generate the report of all HTML files and their
# titles
# =====================================================
report() {
    mapfile -d '' FILES < <(find "$TARGET_DIR" -type f -iname '*.html' -print0 | sort -z)
    total=${#FILES[@]}

    # -------------------------------------------------
    # Section 1: All titles
    # -------------------------------------------------
    header "ALL HTML PAGE TITLES"
    n=0
    for file in "${FILES[@]}"; do
        title=$(get_title "$file")
        ((n++))
        entry "$n" "$file" "$title" "${#title}"
    done
    line '-'
    echo "Total files processed : $total"
    line '-'

    # -------------------------------------------------
    # Section 2: Titles longer than the limit
    # -------------------------------------------------
    header "TITLES LONGER THAN $LIMIT CHARACTERS"
    long=0
    for file in "${FILES[@]}"; do
        title=$(get_title "$file")
        if (( ${#title} > LIMIT )); then
            ((long++))
            entry "$long" "$file" "$title" "${#title}"
        fi
    done
    line '-'
    echo "Total files checked        : $total"
    echo "Total titles over $LIMIT chars : $long"
    line '-'

    # -------------------------------------------------
    # Section 3: Final summary
    # -------------------------------------------------
    header "FINAL SUMMARY"
    echo "  Folder scanned        : $TARGET_DIR"
    echo "  Total HTML files      : $total"
    echo "  Titles over $LIMIT chars : $long"
    echo
    line '='
}

# =====================================================
# Show the report on screen and save it to the file
# =====================================================
report | tee "$OUT"

echo
echo "Saved to: $OUT"