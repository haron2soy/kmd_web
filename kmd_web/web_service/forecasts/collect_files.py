def collect_files(year, month):
    month = month.lower()
    base_path = os.path.join(settings.MEDIA_ROOT, "rsmc", year, month)

    if not os.path.exists(base_path):
        return []

    collected = []

    for day in os.listdir(base_path):
        day_path = os.path.join(base_path, day)

        if not os.path.isdir(day_path):
            continue

        for filename in os.listdir(day_path):
            collected.append({
                "name": filename,
                "day": day,
                "path": os.path.join(day_path, filename)
            })

    return collected