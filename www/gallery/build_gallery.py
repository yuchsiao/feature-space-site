def build_gallery(folder):
    import os.path

    filename = os.path.join(folder, "TITLE.md")
    with open(filename) as f:
        content = f.readlines()

    for line in content:
        line = line.strip()

        if line == "":
            continue

        if line[0:2] == "##":
            location = line[2:].strip()
            continue

        if line[0] == "#":
            year = int(line[1:].strip())
            continue

        if line[0] == "+":
            item = line[1:].split(":")
            fname = item[0].strip('" ')
            description = item[1].strip('" ')

        full_fname = os.path.join("gallery", folder, fname)
        rel = "gallery-"+folder
        ext = ".jpg"

        if location.lower() == "miscellaneous":
            print('<a class="fancybox" rel="{0}" href="{1}.jpg" '
                  'title="{2}, {3}"> <img class="pic" src="{1}-low.jpg" alt="" />'
                  '</a> '
                  .format(rel, full_fname, description, year))
        else:
            print('<a class="fancybox" rel="{0}" href="{1}.jpg" '
                  'title="{2}, {3}, {4}"> <img class="pic" src="{1}-low.jpg" alt="" />'
                  '</a> '
                  .format(rel, full_fname, description, location, year))


if __name__ == "__main__":
    import sys
    if len(sys.argv) < 2:
        sys.exit("Usage: {0} folder".format(sys.argv[0]))

    build_gallery(sys.argv[1])

