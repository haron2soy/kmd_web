import cartopy.feature as cfeature

def add_base_map(ax):
    """
    Adds standard Natural Earth base layers:
    land, ocean, lakes, coastlines, and country borders.
    """

    ax.add_feature(cfeature.OCEAN, zorder=0)
    ax.add_feature(cfeature.LAND, facecolor="none", zorder=2)
    ax.add_feature(
        cfeature.LAKES,
        edgecolor="black",
        facecolor="lightblue",
        zorder=2
    )

    ax.coastlines(resolution="10m", linewidth=0.8, zorder=4)
    ax.add_feature(
        cfeature.BORDERS,
        linewidth=1.0,
        linestyle="-",
        alpha=0.8,
        zorder=4
    )
